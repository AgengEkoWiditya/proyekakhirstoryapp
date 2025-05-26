import HomePresenter from './home-presenter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import createPushNotificationButton from '../../utils/push-notification';

// Fix path ikon Leaflet agar kompatibel dengan Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default class HomePage {
  async render() {
    return `
      <main id="main-content" class="home-container" tabindex="-1" role="main" aria-label="Home page with stories and map">
        <h1 class="page-title">Hallow Selamat Datang Di Beranda Story App Eko</h1>
        <section aria-label="Map showing story locations">
          <div id="map" class="map-container" role="region" tabindex="0"></div>
        </section>
        <section aria-label="List of stories" class="story-list-container">
          <h2 class="section-title">Stories</h2>
          <div id="storyList" class="story-list" aria-live="polite" aria-busy="false"></div>
        </section>
      </main>
    `;
  }

  async afterRender() {
    const storyContainer = document.querySelector('#storyList');
    const mapContainer = document.querySelector('#map');
    const mainContent = document.querySelector('#main-content');

    if (!storyContainer || !mapContainer || !mainContent) {
      console.error('Element #storyList, #map, or #main-content not found.');
      return;
    }

    // Tampilkan loading indicator
    storyContainer.setAttribute('aria-busy', 'true');
    storyContainer.innerHTML = `<p class="loading">Loading stories...</p>`;

    const result = await HomePresenter.getStories();

    if (result.error) {
      storyContainer.setAttribute('aria-busy', 'false');
      storyContainer.innerHTML = `<p class="error-message">${result.message}</p>`;
      return;
    }

    const stories = result.listStory;

    if (stories.length === 0) {
      storyContainer.setAttribute('aria-busy', 'false');
      storyContainer.innerHTML = '<p>No stories available at the moment.</p>';
      return;
    }

    // Initialize map
    const map = L.map(mapContainer).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markers = [];

    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        const popupContent = `
          <div class="popup-content">
            <strong>${story.name}</strong><br/>
            <p>${story.description}</p>
            <a href="#/story/${story.id}" aria-label="See details of ${story.name}">Details</a>
          </div>
        `;
        marker.bindPopup(popupContent);
        markers.push(marker);
      }
    });

    // Zoom sesuai jumlah marker
    if (markers.length > 1) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    } else if (markers.length === 1) {
      map.setView(markers[0].getLatLng(), 13);
    } else {
      map.setView([0, 0], 2);
    }

    // Render daftar story
    const storyHtml = stories.map(story => `
      <article class="story-item" tabindex="0" aria-label="Story from ${story.name}">
        <img src="${story.photoUrl}" alt="Photo from ${story.name}" class="story-img" loading="lazy" />
        <h3 class="story-title">${story.name}</h3>
        <p class="story-description">${story.description}</p>
        <time datetime="${story.createdAt}" class="story-date">
          ${new Date(story.createdAt).toLocaleString()}
        </time>
        <a href="#/story/${story.id}" class="story-details-link" aria-label="See details of ${story.name}">Read more</a>
      </article>
    `).join('');

    storyContainer.setAttribute('aria-busy', 'false');
    storyContainer.innerHTML = storyHtml;

    // Tambahkan tombol push notification
    const pushButton = createPushNotificationButton();
    mainContent.appendChild(pushButton);
  }
}
