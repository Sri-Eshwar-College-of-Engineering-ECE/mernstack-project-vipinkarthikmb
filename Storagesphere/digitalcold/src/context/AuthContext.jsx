import { createContext, useContext, useMemo, useState } from 'react'
import apiClient from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		const cached = localStorage.getItem('storagesphere-user')
		return cached ? JSON.parse(cached) : null
	})

	const login = (userData) => {
		setUser(userData)
		localStorage.setItem('storagesphere-user', JSON.stringify(userData))
	}

	const persistAuth = ({ token, user: authUser }) => {
		localStorage.setItem('storagesphere-token', token)
		localStorage.setItem('storagesphere-user', JSON.stringify(authUser))
		setUser(authUser)
	}

	const loginWithPassword = async ({ email, password }) => {
		const { data } = await apiClient.post('/auth/login', { email, password })
		persistAuth(data)
		return data
	}

	const registerCompany = async (payload) => {
		const { data } = await apiClient.post('/auth/register', payload)
		persistAuth(data)
		return data
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem('storagesphere-user')
		localStorage.removeItem('storagesphere-token')
	}

	const value = useMemo(
		() => ({
			user,
			isAuthenticated: Boolean(user),
			login,
			loginWithPassword,
			registerCompany,
			logout,
		}),
		[user],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
