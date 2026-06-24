import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export type AuthUser = { id: string; name: string; role: string }

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
