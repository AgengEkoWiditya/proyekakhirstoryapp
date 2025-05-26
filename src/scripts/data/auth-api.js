class AuthApi {
  static async register(userData) {
    return AuthApi.#postRequest('https://story-api.dicoding.dev/v1/register', userData);
  }

  static async login(credentials) {
    return AuthApi.#postRequest('https://story-api.dicoding.dev/v1/login', credentials);
  }

  static async #postRequest(url, data) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Request failed');
      }

      return res.json();
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
}

export default AuthApi;
