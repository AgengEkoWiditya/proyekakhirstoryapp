import IdbHelper from './indexeddb.js'; // sesuaikan path-nya

async function loadStories() {
  try {
    const response = await fetch('https://story-api.dicoding.dev/v1/stories');
    if (!response.ok) throw new Error('Network response not ok');
    const data = await response.json();

    // Simpan ke IndexedDB
    await IdbHelper.saveMultipleStories(data.listStory);

    // Render cerita dan peta
    renderStories(data.listStory);
    initMapWithMarkers(data.listStory);

  } catch (error) {
    console.warn('Fetch gagal, fallback ke cache IndexedDB:', error);

    // Ambil data dari IndexedDB
    const cachedStories = await IdbHelper.getAllStories();

    if (cachedStories.length > 0) {
      renderStories(cachedStories);
      initMapWithMarkers(cachedStories);
      showToast('Anda sedang offline, data dari cache ditampilkan.');
    } else {
      showError('Tidak ada data cerita yang tersedia offline.');
    }
  }
}

// Contoh fungsi render sederhana
function renderStories(stories) {
  const container = document.getElementById('stories-container');
  container.innerHTML = '';
  stories.forEach((story) => {
    const el = document.createElement('div');
    el.textContent = story.title;
    container.appendChild(el);
  });
}

// Contoh inisialisasi peta (gunakan Leaflet atau lainnya)
function initMapWithMarkers(stories) {
  // Misal sudah punya objek map Leaflet global "map"
  if (!window.map) {
    window.map = L.map('map').setView([-6.2, 106.8], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(window.map);
  }

  stories.forEach(story => {
    if (story.lat && story.lon) {
      L.marker([story.lat, story.lon]).addTo(window.map)
        .bindPopup(story.title);
    }
  });
}

// Fungsi untuk menampilkan toast atau alert
function showToast(message) {
  alert(message); // ganti dengan UI toast kalau ada
}

function showError(message) {
  alert(message); // ganti dengan UI error display
}

// Panggil fungsi loadStories di halaman utama
loadStories();
