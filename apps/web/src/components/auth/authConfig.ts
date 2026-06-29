import type { UserRole } from '@pinequest/types'

export type AuthData = { token: string; user: { id: string; name: string; role: string } }

/** Roles a person may pick when self-registering (admin/dentist/follow_up are provisioned).
 *  Default is the plain user (parent) — they see only their own child's data. */
export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'parent', label: 'Хэрэглэгч (эцэг эх)' },
  { value: 'teacher', label: 'Багш' },
  { value: 'school_doctor', label: 'Сургууль/цэцэрлэгийн эмч' },
]

// Padding + text size mirror Dropdown's `md` trigger (px-3 py-2 text-[13px])
// so inputs and dropdown buttons render at the same height.
export const inputCls =
  'w-full rounded-full border border-border bg-surface px-3 py-2 text-[13px] text-text-base placeholder:text-text-muted transition-all duration-150 hover:border-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40'

export const selectCls = `${inputCls} cursor-pointer appearance-none pr-9`

export const submitCls =
  'btn mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-3 py-2.5 text-[14px] font-semibold text-text-on-primary shadow-(--shadow-card) transition-all duration-150 hover:bg-primary-hover active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50'

/** Map a server/validation error code to Mongolian copy. Covers login + register. */
export const authErrorText = (msg: string): string => {
  switch (msg) {
    case 'invalid_credentials':
      return 'Имэйл/утас эсвэл нууц үг буруу байна'
    case 'wrong_password':
      return 'Нууц үг буруу байна'
    case 'user_not_found':
      return 'Та бүртгэлгүй байна. Бүртгүүлнэ үү'
    case 'passwords_mismatch':
      return 'Нууц үг таарахгүй байна'
    case 'phone_taken':
      return 'Энэ утасны дугаар аль хэдийн бүртгэлтэй байна'
    case 'email_taken':
      return 'Энэ имэйл аль хэдийн бүртгэлтэй байна'
    case 'invalid_input':
      return 'Нэр, утас болон 6+ тэмдэгт нууц үг шаардлагатай'
    case 'school_required':
      return 'Сургууль / цэцэрлэгийн нэрээ оруулна уу'
    case 'child_name_required':
      return 'Хүүхдийн нэрийг оруулна уу'
    case 'child_not_found':
      return 'Энэ нэртэй хүүхэд олдсонгүй'
    default:
      return 'Серверт холбогдсонгүй, дахин оролдоно уу'
  }
}
