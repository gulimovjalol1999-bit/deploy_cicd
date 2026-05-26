import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let queue: Array<(token: string) => void> = []

function processQueue(token: string) {
  queue.forEach((cb) => cb(token))
  queue = []
}

// Unwrap { success, timestamp, data } envelope; refresh token on 401
client.interceptors.response.use(
  (res) => {
    if (res.data?.success === true && 'data' in res.data) {
      res.data = res.data.data
    }
    return res
  },
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(client(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const res = await axios.post('/api/v1/auth/refresh', null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      const newToken = res.data?.data?.accessToken ?? res.data?.accessToken
      localStorage.setItem('accessToken', newToken)
      processQueue(newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return client(original)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)

export default client
