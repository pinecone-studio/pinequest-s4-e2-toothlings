"""
IMU FEATURE CONTRACT (Python) — MUST MATCH featureContract.ts byte-for-byte in
math. Vectorized with numpy for speed.

Per-frame feature vector (FEATURE_DIM = 11):
  [0..2] gravity unit vector (sensor frame, drift-free pitch/roll)
  [3..5] gyro (deg/s) / GYRO_SCALE, clipped
  [6..8] linear accel (g) / ACCEL_SCALE, clipped
  [9]    sin(relative yaw vs calibration)
  [10]   cos(relative yaw)
"""
from __future__ import annotations

import numpy as np

import config as C


def normalize_quat(q: np.ndarray) -> np.ndarray:
    """q: (..., 4) [w,x,y,z] → canonical w>=0, unit length."""
    n = np.linalg.norm(q, axis=-1, keepdims=True)
    n = np.where(n < 1e-8, 1.0, n)
    q = q / n
    sign = np.where(q[..., 0:1] < 0, -1.0, 1.0)
    return q * sign


def quat_conjugate(q: np.ndarray) -> np.ndarray:
    out = q.copy()
    out[..., 1:] *= -1.0
    return out


def quat_mul(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    aw, ax, ay, az = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    bw, bx, by, bz = b[..., 0], b[..., 1], b[..., 2], b[..., 3]
    return np.stack(
        [
            aw * bw - ax * bx - ay * by - az * bz,
            aw * bx + ax * bw + ay * bz - az * by,
            aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw,
        ],
        axis=-1,
    )


def gravity_from_quat(q: np.ndarray) -> np.ndarray:
    w, x, y, z = q[..., 0], q[..., 1], q[..., 2], q[..., 3]
    return np.stack(
        [
            2 * (x * z - w * y),
            2 * (w * x + y * z),
            w * w - x * x - y * y + z * z,
        ],
        axis=-1,
    )


def yaw_of_quat(q: np.ndarray) -> np.ndarray:
    w, x, y, z = q[..., 0], q[..., 1], q[..., 2], q[..., 3]
    return np.arctan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))


def ypr_to_quat(yaw_deg: np.ndarray, pitch_deg: np.ndarray, roll_deg: np.ndarray) -> np.ndarray:
    cy, sy = np.cos(np.radians(yaw_deg) / 2), np.sin(np.radians(yaw_deg) / 2)
    cp, sp = np.cos(np.radians(pitch_deg) / 2), np.sin(np.radians(pitch_deg) / 2)
    cr, sr = np.cos(np.radians(roll_deg) / 2), np.sin(np.radians(roll_deg) / 2)
    q = np.stack(
        [
            cr * cp * cy + sr * sp * sy,
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy,
        ],
        axis=-1,
    )
    return normalize_quat(q)


def _quat_from_raw(samples: np.ndarray) -> np.ndarray:
    """samples: (N, RAW_DIM). Use DMP quaternion if non-trivial else build from ypr."""
    quat = samples[:, 1:5]  # qw,qx,qy,qz
    has_quat = np.linalg.norm(quat, axis=-1) > 0.1
    built = ypr_to_quat(samples[:, 5], samples[:, 6], samples[:, 7])
    quat = np.where(has_quat[:, None], quat, built)
    return normalize_quat(quat)


def extract_features(samples: np.ndarray, ref_quat: np.ndarray) -> np.ndarray:
    """
    samples: (N, RAW_DIM) raw rows. ref_quat: (4,) calibration quaternion.
    returns: (N, FEATURE_DIM)
    """
    q = _quat_from_raw(samples)
    grav = gravity_from_quat(q)

    gyro = samples[:, 8:11]
    accel = samples[:, 11:14]
    lin_accel = accel - grav

    ref = normalize_quat(ref_quat.reshape(1, 4))
    rel = quat_mul(quat_conjugate(np.repeat(ref, q.shape[0], axis=0)), q)
    rel_yaw = yaw_of_quat(rel)

    feat = np.concatenate(
        [
            grav,
            np.clip(gyro / C.GYRO_SCALE, -1, 1),
            np.clip(lin_accel / C.ACCEL_SCALE, -1, 1),
            np.sin(rel_yaw)[:, None],
            np.cos(rel_yaw)[:, None],
        ],
        axis=-1,
    ).astype(np.float32)
    assert feat.shape[1] == C.FEATURE_DIM, (feat.shape, C.FEATURE_DIM)
    return feat


def gyro_magnitude(samples: np.ndarray) -> np.ndarray:
    return np.linalg.norm(samples[:, 8:11], axis=-1)
