import HomePresenter from './home-presenter';
import IdbHelper from '../../utils/indexeddb';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default class HomePage {
  async render() {
    return `
      <main id="main-content" class="home-container" tabindex="-1" role="main">
        <h1 class="page-title">Berbagi Cerita</h1>
        <div class="offline-controls">
          <button id="clearOfflineBtn" class="offline-button danger" aria-label="Hapus semua data offline">
            🗑️ Hapus Semua Data Offline
          </button>
        </div>
        <div id="map" class="map-container" aria-label="Story locations map" role="region"></div>
        <div id="storyList" class="story-list"></div>
      </main>
    `;
  }

  async afterRender() {
    const storyContainer = document.querySelector('#storyList');
    const mapContainer = document.querySelector('#map');
    const clearOfflineBtn = document.querySelector('#clearOfflineBtn');

    const renderStories = (stories) => {
      if (!stories || stories.length === 0) {
        storyContainer.innerHTML = '<p>Tidak ada story.</p>';
        return;
      }

      const storyHtml = stories.map((story) => {
        const photoSrc = story.photo || story.photoUrl || 'default.jpg';
        return `
          <article class="story-item">
            <img src="${photoSrc}" alt="Photo from ${story.name}" class="story-img" />
            <h2 class="story-title">${story.name}</h2>
            <p class="story-description">${story.description}</p>
            <time datetime="${story.createdAt}" class="story-date">
              ${new Date(story.createdAt).toLocaleString()}
            </time>
          </article>
        `;
      }).join('');
      storyContainer.innerHTML = storyHtml;
    };

    const renderMap = (stories) => {
      const map = L.map(mapContainer).setView([-2.5, 118], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`<strong>${story.name}</strong><br>${story.description}`);
        }
      });
    };

    try {
      const result = await HomePresenter.getStories();
      if (result.error) {
        throw new Error(result.message);
      }

      const stories = result.listStory;
      renderStories(stories);
      renderMap(stories);
    } catch (error) {
      const offlineStories = await IdbHelper.getAllStories();
      storyContainer.innerHTML = `<p>Menampilkan data offline karena terjadi kesalahan: ${error.message}</p>`;
      renderStories(offlineStories);
      renderMap(offlineStories);
    }

    clearOfflineBtn.addEventListener('click', async () => {
      const offlineStories = await IdbHelper.getAllStories();
      if (offlineStories.length === 0) {
        alert('Tidak ada data offline untuk dihapus.');
        return;
      }

      const confirmDelete = confirm('Apakah Anda yakin ingin menghapus semua data offline?');
      if (confirmDelete) {
        for (const story of offlineStories) {
          await IdbHelper.deleteStory(story.id);
        }
        alert('Semua data offline berhasil dihapus.');
        storyContainer.innerHTML = '<p>Semua data offline telah dihapus.</p>';
      }
    });
  }
}
