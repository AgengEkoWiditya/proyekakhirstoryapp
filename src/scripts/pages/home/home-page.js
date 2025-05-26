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

let map; // Instance global map
let markersGroup; // LayerGroup untuk semua marker agar lebih mudah kontrol

export default class HomePage {
  constructor() {
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.loadStories = this.loadStories.bind(this);
  }

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

    if (!storyContainer || !mapContainer || !pushContainer || !refreshBtn) {
      console.error('Element yang dibutuhkan tidak ditemukan.');
      return;
    }

    // Push Notification button
    const pushButton = createPushNotificationButton();
    pushContainer.innerHTML = '';
    pushContainer.appendChild(pushButton);

    // Event refresh stories
    refreshBtn.removeEventListener('click', this.loadStories);
    refreshBtn.addEventListener('click', this.loadStories);

    // Initialize map (buat sekali saja)
    if (!map) {
      map = L.map(mapContainer).setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // LayerGroup untuk marker, memudahkan clear dan manipulasi marker
      markersGroup = L.layerGroup().addTo(map);
    }

    // Load stories pertama kali
    await this.loadStories();

    // Event delegation untuk delete story
    storyContainer.removeEventListener('click', this.handleDeleteClick);
    storyContainer.addEventListener('click', this.handleDeleteClick);
  }

  async loadStories() {
    const storyContainer = document.querySelector('#storyList');
    storyContainer.setAttribute('aria-busy', 'true');
    storyContainer.innerHTML = `<p class="loading">Loading stories...</p>`;

    try {
      const result = await HomePresenter.getStories();

      storyContainer.innerHTML = ''; // Clear container

      if (result.error) {
        storyContainer.setAttribute('aria-busy', 'false');
        storyContainer.innerHTML = `<p class="error-message">${result.message}</p>`;
        this.resetMapView();
        return;
      }

      const stories = result.listStory || [];

      // Notifikasi offline
      if (result.isOffline) {
        const offlineNotice = document.createElement('p');
        offlineNotice.className = 'offline-notice';
        offlineNotice.setAttribute('role', 'alert');
        offlineNotice.textContent = result.message || 'Menampilkan data dari cache (offline mode)';
        storyContainer.appendChild(offlineNotice);
      }

      if (stories.length === 0) {
        storyContainer.setAttribute('aria-busy', 'false');
        storyContainer.innerHTML += '<p>Tidak ada cerita saat ini.</p>';
        this.resetMapView();
        return;
      }

      // Bersihkan marker lama
      this.clearMapMarkers();

      // Tambah marker baru ke LayerGroup
      stories.forEach((story) => {
        if (story.lat != null && story.lon != null) {
          const marker = L.marker([story.lat, story.lon]);
          const popupContent = `
            <div class="popup-content">
              <strong>${this.escapeHtml(story.name || 'No Name')}</strong><br/>
              <p>${this.escapeHtml(story.description || '')}</p>
              <a href="#/story/${encodeURIComponent(story.id)}" aria-label="See details of ${this.escapeHtml(story.name || 'story')}">Details</a>
            </div>
          `;
          marker.bindPopup(popupContent);
          markersGroup.addLayer(marker);
        }
      });

      // Sesuaikan view map
      const markerCount = markersGroup.getLayers().length;
      if (markerCount > 1) {
        const groupBounds = markersGroup.getBounds();
        map.fitBounds(groupBounds.pad(0.2));
      } else if (markerCount === 1) {
        map.setView(markersGroup.getLayers()[0].getLatLng(), 13);
      } else {
        this.resetMapView();
      }

      // Render daftar cerita
      const storyArticles = stories.map((story) => `
        <article class="story-item" tabindex="0" aria-label="Story from ${this.escapeHtml(story.name || 'Unknown')}">
          <img src="${this.sanitizeUrl(story.photoUrl) || 'default-photo.png'}" alt="Photo from ${this.escapeHtml(story.name || 'Unknown')}" class="story-img" loading="lazy" />
          <h3 class="story-title">${this.escapeHtml(story.name || 'No Name')}</h3>
          <p class="story-description">${this.escapeHtml(story.description || '')}</p>
          <time datetime="${story.createdAt}" class="story-date">${new Date(story.createdAt).toLocaleString()}</time>
          <a href="#/story/${encodeURIComponent(story.id)}" class="story-details-link" aria-label="See details of ${this.escapeHtml(story.name || 'story')}">Read more</a>
          <button class="delete-btn" data-id="${this.escapeHtml(story.id)}" aria-label="Hapus story ${this.escapeHtml(story.name || 'story')}">Hapus</button>
        </article>
      `).join('');

      storyContainer.innerHTML += storyArticles;
      storyContainer.setAttribute('aria-busy', 'false');

    } catch (error) {
      storyContainer.setAttribute('aria-busy', 'false');
      storyContainer.innerHTML = `<p class="error-message">Terjadi kesalahan saat memuat cerita: ${error.message}</p>`;
      this.resetMapView();
    }
  }

  clearMapMarkers() {
    if (markersGroup) {
      markersGroup.clearLayers();
    }
  }

  resetMapView() {
    if (map) {
      map.setView([0, 0], 2);
    }
  }

  async handleDeleteClick(event) {
    if (event.target.classList.contains('delete-btn')) {
      const id = event.target.dataset.id;
      if (!id) return;
      const confirmDelete = confirm('Yakin ingin menghapus story ini?');
      if (!confirmDelete) return;

      try {
        const res = await HomePresenter.deleteStoryById(id);
        alert(res.message || 'Story berhasil dihapus.');
        await this.loadStories();
      } catch (error) {
        alert(`Gagal menghapus story: ${error.message}`);
      }
    }
  }

  // Escape HTML untuk keamanan XSS
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Sanitasi URL sederhana untuk src image (hindari javascript: atau data yang aneh)
  sanitizeUrl(url) {
    if (!url) return '';
    try {
      const parsedUrl = new URL(url, window.location.origin);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'data:') {
        return url;
      }
      return '';
    } catch {
      return '';
    }
  }
}
