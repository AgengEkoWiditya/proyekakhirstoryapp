import AuthApi from '../../data/auth-api';

const LoginPresenter = {
  async login(credentials) {
    const result = await AuthApi.login(credentials);

    if (!result.error && result.loginResult?.token) {
      localStorage.setItem('authToken', result.loginResult.token);
    }

    return result;
  }
};

export default LoginPresenter;
