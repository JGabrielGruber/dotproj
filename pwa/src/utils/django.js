import axios from 'axios'
import Cookies from 'js-cookie'

import useDebugStore from 'src/stores/debug.store'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000' // Switch to https://api.portal.com in prod

// Axios instance with credentials for cookies
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
})

// Get CSRF token from cookie or API response
const getCsrfToken = () => Cookies.get('csrftoken') || null

// Check session
export const checkSession = async () => {
  try {
    const response = await api.get(
      '/_allauth/browser/v1/auth/session',
      { timeout: 5000, },
    )
    return response.data
  } catch (error) {
    if (error.response) {
      return error.response.data
    }
    throw new Error('Network error')
  }
}

// Login with Google token
export const loginWithGoogle = async (idToken) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const csrfToken = getCsrfToken()
  try {
    const response = await api.post(
      '/_allauth/browser/v1/auth/provider/token',
      {
        provider: 'google',
        process: 'login',
        token: { id_token: idToken, client_id: clientId },
      },
      { headers: { 'X-CSRFToken': csrfToken } }
    )
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed')
  }
}

// Logout
export const logout = async () => {
  try {
    const csrfToken = getCsrfToken()
    const response = await api.delete('/_allauth/browser/v1/auth/session', {
      headers: { 'X-CSRFToken': csrfToken },
    })
    Cookies.remove('csrftoken')
    Cookies.remove('sessionid')
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      // 401 means session is already gone, treat as success
      Cookies.remove('csrftoken')
      Cookies.remove('sessionid')
      return { status: 200, data: {}, meta: { is_authenticated: false } }
    }
    throw new Error(error.response?.data?.error || 'Logout failed')
  }
}

// Utility for other stores to make authenticated API calls
export const apiWithAuth = async (method, endpoint, data = {}) => {
  const csrfToken = getCsrfToken()
  try {
    const response = await api({
      method,
      url: endpoint,
      data,
      headers: { 'X-CSRFToken': csrfToken },
    })
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      return { data: response.data, etag: response.headers.etag }
    }
    throw new Error('No JSON data')
  } catch (error) {
    console.error(error)
    throw new Error(error.response?.data?.error || error)
  }
}
