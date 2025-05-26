import AboutPresenter from './about-presenter';

export default class AboutPage {
  async render() {
    return `
    <main id="main-content" tabindex="-1">
      <section class="container about-container" role="region" aria-labelledby="aboutTitle">
        <h1 id="aboutTitle">Tentang Aplikasi Eko</h1>
        <p>StoryApp hadir sebagai wadah digital untuk membagikan kisah dan pengalaman berharga, sambil mengeksplorasi tempat-tempat menarik di sekitar kita. Platform ini dirancang untuk menginspirasi dan menghubungkan sesama melalui cerita yang bermakna.</p>

        <section class="about-vision">
          <h2>Visi Kami</h2>
          <p>Kami ingin membangun komunitas yang berbagi narasi berdasarkan lokasi yang mereka jelajahi, menciptakan sudut pandang baru tentang dunia dan hubungan manusia dengan lingkungannya.</p>
        </section>

        <section class="about-contact">
          <h2>Kontak</h2>
          <p>Ingin tahu lebih lanjut atau berbincang langsung? Jangan ragu untuk menghubungi saya melalui platform berikut:</p>
          <ul>
            <li><strong>WhatsApp:</strong> <a href="https://wa.me/6285324712351" aria-label="Kirim pesan lewat WhatsApp">Klik di sini</a></li>
            <li><strong>Instagram:</strong> <a href="https://instagram.com/agengekowiditya" aria-label="Profil Instagram Eko">@agengekowiditya</a></li>
          </ul>
        </section>
      </section>
    </main>
    `;
  }

  async afterRender() {
    AboutPresenter.init();
  }
}
