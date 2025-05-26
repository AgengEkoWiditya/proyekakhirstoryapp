import RegisterPresenter from './register-presenter';

class RegisterPage {
  async render() {
    return `
      <style>
        .spinner {
          margin: 10px auto 0;
          width: 30px;
          height: 30px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top-color: #9b59b6;
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

        .register-btn {
          margin-top: 20px;
          background: linear-gradient(to right, #8e2de2, #4a00e0);
          color: white;
          font-weight: bold;
          border: none;
          padding: 12px 0;
          border-radius: 10px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: background 0.3s;
        }

        .register-btn:hover {
          background: linear-gradient(to right, #7d2be2, #3a00d0);
        }

        .register-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .register-header i {
          font-size: 2.5rem;
          color: #8e2de2;
        }

        .register-header h2 {
          margin: 10px 0 5px;
          font-size: 1.8rem;
        }

        .register-header p {
          color: #555;
        }

        .register-footer {
          text-align: center;
          margin-top: 20px;
        }

        .register-footer a {
          color: #6c2bd9;
          font-weight: bold;
          text-decoration: none;
        }
      </style>

      <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
      <main id="main-content" tabindex="-1">
        <section class="register-section">
          <div class="register-container">
            <div class="register-header">
              <i class="fas fa-user-plus" aria-hidden="true"></i>
              <h2>Create an Account</h2>
              <p>Join us and share your stories</p>
            </div>

            <form id="registerForm" class="register-form" role="form">
              <label for="name" class="input-label">Name</label>
              <div class="input-group">
                <i class="fas fa-user" aria-hidden="true"></i>
                <input 
                  id="name" 
                  name="name"
                  type="text" 
                  class="form-input" 
                  placeholder="Name"
                  required
                />
              </div>

              <label for="email" class="input-label">Email Address</label>
              <div class="input-group">
                <i class="fas fa-envelope" aria-hidden="true"></i>
                <input 
                  id="email" 
                  name="email"
                  type="email" 
                  class="form-input" 
                  placeholder="Email Address"
                  required
                />
              </div>

              <label for="password" class="input-label">Password</label>
              <div class="input-group">
                <i class="fas fa-lock" aria-hidden="true"></i>
                <input 
                  id="password" 
                  name="password"
                  type="password" 
                  class="form-input" 
                  placeholder="Password"
                  required
                />
              </div>

              <button type="submit" class="register-btn">
                <i class="fas fa-user-plus" aria-hidden="true"></i> REGISTER
              </button>

              <div id="loadingIndicator" class="loading-indicator" aria-live="polite" role="status">
                <div class="spinner" aria-hidden="true"></div>
              </div>
            </form>

            <div class="register-footer">
              <p>Already have an account? <a href="#/login">Login here</a></p>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  async afterRender() {
    // Tambahkan Font Awesome jika belum ada
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }

    // Buat elemen notifikasi toast dan style-nya
    const toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.backgroundColor = '#4BB543'; // hijau sukses
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    toast.style.fontWeight = 'bold';
    toast.style.display = 'none';
    toast.style.zIndex = '9999';
    document.body.appendChild(toast);

    const form = document.querySelector('#registerForm');
    const loading = document.querySelector('#loadingIndicator');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      loading.style.display = 'block';
      submitButton.disabled = true;

      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      try {
        const result = await RegisterPresenter.register({ name, email, password });

        if (!result.error) {
          // Tampilkan notifikasi berhasil
          toast.textContent = 'Registrasi berhasil! Mengarahkan ke halaman login...';
          toast.style.display = 'block';

          // Sembunyikan toast setelah 3 detik dan pindah halaman
          setTimeout(() => {
            toast.style.display = 'none';
            window.location.hash = '/login';
          }, 3000);
        } else {
          alert(result.message);
        }
      } catch (err) {
        alert('Terjadi kesalahan saat mendaftar.');
      } finally {
        loading.style.display = 'none';
        submitButton.disabled = false;
      }
    });
  }
}

export default RegisterPage;
