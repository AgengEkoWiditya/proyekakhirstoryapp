import HomePresenter from './home-presenter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createPushNotificationButton } from '../../utils/push-notification';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

let map; // untuk menyimpan instance map global

export default class HomePage {
  async render() {
    return `
      <main id="main-content" class="home-container" tabindex="-1" role="main" aria-label="Home page with stories and map">
        <h1 class="page-title">Halo, Selamat Datang di Beranda Story App Eko</h1>

        <section aria-label="Push Notification" class="push-container">
          <div id="pushContainer" class="push-button-wrapper"></div>
        </section>

        <section aria-label="Map showing story locations">
          <div id="map" class="map-container" role="region" tabindex="0" aria-live="polite"></div>
        </section>

        <section aria-label="List of stories" class="story-list-container">
          <h2 class="section-title">Stories</h2>
          <button id="refreshBtn" class="refresh-btn" aria-label="Refresh stories">🔄 Refresh</button>
          <div id="storyList" class="story-list" aria-live="polite" aria-busy="false"></div>
        </section>
      </main>
    `;
  }

  async afterRender() {
    const storyContainer = document.querySelector('#storyList');
    const mapContainer = document.querySelector('#map');
    const pushContainer = document.querySelector('#pushContainer');
    const refreshBtn = document.querySelector('#refreshBtn');

    if (!storyContainer || !mapContainer || !pushContainer) {
      console.error('Element yang dibutuhkan tidak ditemukan.');
      return;
    }

    // Tombol push notification
    const pushButton = createPushNotificationButton();
    pushContainer.innerHTML = ''; // Clear sebelum append
    pushContainer.appendChild(pushButton);

    // Refresh stories dengan debounce sederhana agar tidak terlalu sering reload
    refreshBtn?.removeEventListener('click', this._refreshHandler);
    this._refreshHandler = async () => {
      storyContainer.setAttribute('aria-busy', 'true');
      storyContainer.innerHTML = `<p class="loading">Loading stories...</p>`;
      await this.afterRender();
    };
    refreshBtn?.addEventListener('click', this._refreshHandler);

    storyContainer.setAttribute('aria-busy', 'true');
    storyContainer.innerHTML = `<p class="loading">Loading stories...</p>`;

    // Ambil stories (online + offline)
    const result = await HomePresenter.getStories();

    storyContainer.innerHTML = ''; // Clear dulu

    if (result.error) {
      storyContainer.setAttribute('aria-busy', 'false');
      storyContainer.innerHTML = `<p class="error-message">${result.message}</p>`;
      return;
    }

    const stories = result.listStory;

    // Tampilkan notifikasi offline jika mode offline
    if (result.isOffline) {
      const offlineNotice = document.createElement('p');
      offlineNotice.className = 'offline-notice';
      offlineNotice.setAttribute('role', 'alert');
      offlineNotice.textContent = result.message || 'Menampilkan data dari cache (offline mode)';
      storyContainer.appendChild(offlineNotice);
    }

    if (!Array.isArray(stories) || stories.length === 0) {
      storyContainer.setAttribute('aria-busy', 'false');
      storyContainer.innerHTML += '<p>No stories available at the moment.</p>';
      return;
    }

    // Bersihkan map lama (jika ada)
    if (map) {
      map.remove();
    }

    // Inisialisasi Leaflet map
    map = L.map(mapContainer).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markers = [];

    stories.forEach((story) => {
      if (story.lat != null && story.lon != null) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        const popupContent = `
          <div class="popup-content">
            <strong>${story.name || 'No Name'}</strong><br/>
            <p>${story.description || ''}</p>
            <a href="#/story/${story.id}" aria-label="See details of ${story.name || 'story'}">Details</a>
          </div>
        `;
        marker.bindPopup(popupContent);
        markers.push(marker);
      }
    });

    // Atur viewport map agar semua marker terlihat
    if (markers.length > 1) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    } else if (markers.length === 1) {
      map.setView(markers[0].getLatLng(), 13);
    }

    // Render daftar cerita
    const storyArticles = stories.map((story) => `
      <article class="story-item" tabindex="0" aria-label="Story from ${story.name || 'Unknown'}">
        <img src="${story.photoUrl || 'default-photo.png'}" alt="Photo from ${story.name || 'Unknown'}" class="story-img" loading="lazy" />
        <h3 class="story-title">${story.name || 'No Name'}</h3>
        <p class="story-description">${story.description || ''}</p>
        <time datetime="${story.createdAt}" class="story-date">${new Date(story.createdAt).toLocaleString()}</time>
        <a href="#/story/${story.id}" class="story-details-link" aria-label="See details of ${story.name || 'story'}">Read more</a>
        <button class="delete-btn" data-id="${story.id}" aria-label="Hapus story ${story.name || 'story'}">Hapus</button>
      </article>
    `).join('');

    storyContainer.innerHTML += storyArticles;
    storyContainer.setAttribute('aria-busy', 'false');

    // Event listener untuk tombol hapus
    const deleteButtons = storyContainer.querySelectorAll('.delete-btn');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        const id = event.target.dataset.id;
        if (confirm('Yakin ingin menghapus story ini?')) {
          const res = await HomePresenter.deleteStoryById(id);
          alert(res.message);
          this.afterRender();
        }
      });
    });
  }
}
