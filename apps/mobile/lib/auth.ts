import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
// Credentials from the LAST successful ONLINE login, so a screener who logged in
// while they had signal can re-enter the app in a no-signal soum (offline login).
// Stored only in SecureStore (Android Keystore / iOS Keychain, encrypted at rest),
// the same vault that already holds the JWT — never in the synced payload.
const OFFLINE_ID_KEY = 'offline_login_id'
const OFFLINE_PW_KEY = 'offline_login_pw'

export type AuthUser = { id: string; name: string; role: string; schoolId?: string | null }

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY)
export const saveToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token)
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY)

export const getUser = async (): Promise<AuthUser | null> => {
  const raw = await SecureStore.getItemAsync(USER_KEY)
  return raw ? (JSON.parse(raw) as AuthUser) : null
}
export const saveUser = (user: AuthUser) =>
  SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
export const clearUser = () => SecureStore.deleteItemAsync(USER_KEY)

/** Remember this login so the same identifier+password unlocks the app offline. */
export const saveOfflineCredential = async (identifier: string, password: string) => {
  await SecureStore.setItemAsync(OFFLINE_ID_KEY, identifier)
  await SecureStore.setItemAsync(OFFLINE_PW_KEY, password)
}

/** True only if the entered credentials match the last successful online login. */
export const verifyOfflineCredential = async (identifier: string, password: string): Promise<boolean> => {
  const id = await SecureStore.getItemAsync(OFFLINE_ID_KEY)
  const pw = await SecureStore.getItemAsync(OFFLINE_PW_KEY)
  return !!id && !!pw && id === identifier && pw === password
}

export const clearOfflineCredential = async () => {
  await SecureStore.deleteItemAsync(OFFLINE_ID_KEY)
  await SecureStore.deleteItemAsync(OFFLINE_PW_KEY)
}
