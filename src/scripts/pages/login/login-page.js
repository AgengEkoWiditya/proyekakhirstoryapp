import LoginPresenter from './login-presenter';

class LoginPage {
  async render() {
    return `
      <style>
        .spinner {
          margin: 10px auto 0;
          width: 30px;
          height: 30px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top-color: #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-indicator {
          display: none;
          text-align: center;
        }

        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #2ecc71;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .toast-icon {
          margin-right: 10px;
          font-size: 1.5rem;
        }

        .toast.show {
          opacity: 1;
          transform: translateY(0);
        }

        .toast.hidden {
          display: none;
        }

        .input-group {
          display: flex;
          align-items: center;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 0 12px;
          gap: 10px;
        }

        .input-group i {
          color: #888;
          font-size: 1rem;
        }

        .form-input {
          border: none;
          outline: none;
          flex: 1;
          padding: 12px 0;
          font-size: 1rem;
          background: transparent;
        }
      </style>

      <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
      <main id="main-content" tabindex="-1">
        <section class="login-section">
          <div class="login-container">
            <div class="login-header">
              <i class="fas fa-user-astronaut login-icon" aria-hidden="true"></i>
              <h2 class="login-title">Welcome Back, Explorer!</h2>
              <p class="login-subtitle">Let’s take off and share your best stories with the world.</p>
            </div>

            <form id="loginForm" class="login-form" role="form">
              <label for="email" class="input-label">Email Address</label>
              <div class="input-group">
                <i class="fas fa-envelope" aria-hidden="true"></i>
                <input 
                  id="email" 
                  type="email" 
                  name="email" 
                  class="form-input"
                  placeholder="your@email.com"
                  required
                  aria-label="Email address"
                />
              </div>

              <label for="password" class="input-label">Password</label>
              <div class="input-group">
                <i class="fas fa-lock" aria-hidden="true"></i>
                <input
                  id="password"
                  type="password"
                  name="password"
                  class="form-input"
                  placeholder="••••••••"
                  required
                  aria-label="Password"
                />
              </div>

              <button type="submit" class="login-btn" aria-live="polite" aria-busy="false">
                <i class="fas fa-sign-in-alt" aria-hidden="true"></i> Sign In
              </button>

              <div id="loadingIndicator" class="loading-indicator" aria-live="polite" role="status" aria-hidden="true">
                <div class="spinner" aria-hidden="true"></div>
                <span class="visually-hidden">Loading...</span>
              </div>
            </form>

            <div class="login-footer">
              <p id="loginMessage" class="message" role="alert"></p>
              <p class="login-prompt">
                Don't have an account? <a href="#/register" class="login-link">Register here</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <div id="toastNotification" class="toast hidden" role="alert" aria-live="polite" aria-atomic="true">
        <div class="toast-icon"><i class="fas fa-check-circle"></i></div>
        <div class="toast-message">Login berhasil!</div>
      </div>
    `;
  }

  async afterRender() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }

    const form = document.querySelector('#loginForm');
    const message = document.querySelector('#loginMessage');
    const loading = document.querySelector('#loadingIndicator');
    const submitButton = form.querySelector('button[type="submit"]');
    const toast = document.querySelector('#toastNotification');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      loading.style.display = 'block';
      loading.setAttribute('aria-hidden', 'false');
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      message.textContent = '';

      const email = form.email.value;
      const password = form.password.value;

      try {
        const result = await LoginPresenter.login({ email, password });
        message.textContent = result.message;

        if (!result.error) {
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('show'), 100);
          setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 500);
          }, 3000);

          setTimeout(() => {
            window.location.hash = '/';
          }, 1000);
        }
      } catch (error) {
        message.textContent = 'Terjadi kesalahan saat login.';
      } finally {
        loading.style.display = 'none';
        loading.setAttribute('aria-hidden', 'true');
        submitButton.disabled = false;
        submitButton.setAttribute('aria-busy', 'false');
      }
    });
  }
}

export default LoginPage;
