import axios from 'axios';

const api = axios.create({
    // Fallback to localhost if env specific var is missing, but also allow relative path for same-domain
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors with forced logout
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // CRITICAL: Detect auth errors and force complete logout
        // Auth errors include: 401, 403, or 404 when an auth token was sent
        const isAuthError =
            error.response?.status === 401 ||
            error.response?.status === 403 ||
            (error.response?.status === 404 && originalRequest?.headers?.Authorization);

        if (isAuthError && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    // No refresh token - force logout immediately
                    forceLogout();
                    return Promise.reject(error);
                }

                // Attempt token refresh
                const response = await axios.post(`${api.defaults.baseURL}/auth/login/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

                // Retry original request with new token
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - force complete logout
                console.error('[AUTH] Token refresh failed, forcing logout:', refreshError);
                forceLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to force complete logout and state cleanup
function forceLogout() {
    console.warn('[AUTH] Forcing logout due to invalid/expired token');

    // Clear all auth state
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();

    // Redirect to login
    window.location.href = '/login';
}


export default api;
