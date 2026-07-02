/**
 * Shared runtime config for the mobile app.
 *
 * The API base URL has a SINGLE source of truth here so the inference path,
 * the outbox sync, and the history prefetch can never drift onto different
 * hosts. `EXPO_PUBLIC_API_URL` (set in apps/mobile/.env) overrides the default.
 */
export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://screener-api.ariunzul.workers.dev'

/** Where the on-device ONNX model is fetched from on first run (cached after). */
export const MODEL_URL = process.env.EXPO_PUBLIC_MODEL_URL

/**
 * The web board's origin. A video call joins the web `/call/{room}` page in an
 * in-app browser (Expo Go has no WebRTC/PeerJS native module, but a browser tab
 * does), so this MUST point at the deployed web app — NOT the API. Set
 * `EXPO_PUBLIC_WEB_URL` in apps/mobile/.env for production.
 */
export const WEB_BASE = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3000'
