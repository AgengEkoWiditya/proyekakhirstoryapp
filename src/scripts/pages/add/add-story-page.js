import AddStoryPresenter from './add-story-presenter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default class AddStoryPage {
  constructor() {
    this.stream = null;
    this.video = null;
    this.map = null;
    this.marker = null;
  }

  async render() {
    return `
      <main id="main-content" tabindex="0">
        <section class="story-wrapper">
          <h2 class="form-title">Buat Cerita Baru</h2>
          <form id="storyForm" class="story-form" role="form">
            <div class="input-block">
              <label for="desc">Deskripsi Cerita</label>
              <textarea id="desc" name="description" required placeholder="Ceritakan sesuatu..."></textarea>
            </div>

            <div class="input-block camera-block">
              <label>Kamera</label>
              <video id="videoPreview" autoplay playsinline></video>
              <div class="camera-controls">
                <button type="button" id="openCam">Buka Kamera</button>
                <button type="button" id="snapShot" disabled>Ambil Gambar</button>
                <button type="button" id="closeCam" style="display:none;">Tutup Kamera</button>
                <label for="uploadFile" class="file-label">Atau pilih gambar dari file</label>
                <input type="file" id="uploadFile" accept="image/*" />
              </div>
              <canvas id="photoCanvas" style="display: none;"></canvas>
              <input type="hidden" id="photoEncoded" name="photoData" />
              <img id="photoResult" style="display:none;" alt="Foto Anda" />
            </div>

            <div class="input-block">
              <label for="mapArea">Lokasi</label>
              <div id="mapArea" class="map-block" aria-label="Pilih lokasi Anda di peta"></div>

              <label for="latitude" class="visually-hidden">Latitude Lokasi</label>
              <input type="hidden" id="latitude" name="lat" />

              <label for="longitude" class="visually-hidden">Longitude Lokasi</label>
              <input type="hidden" id="longitude" name="lon" />
            </div>

            <button type="submit" class="submit-story">Kirim Cerita</button>
            <p id="formAlert" class="form-alert" role="alert"></p>
          </form>
        </section>
      </main>
    `;
  }

  async afterRender() {
    this.video = document.getElementById('videoPreview');
    const canvas = document.getElementById('photoCanvas');
    const openCamBtn = document.getElementById('openCam');
    const closeCamBtn = document.getElementById('closeCam');
    const snapBtn = document.getElementById('snapShot');
    const fileInput = document.getElementById('uploadFile');
    const photoPreview = document.getElementById('photoResult');
    const encodedPhoto = document.getElementById('photoEncoded');

    // Map initialization
    this.map = L.map('mapArea').setView([-6.2, 106.8], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById('latitude').value = lat;
      document.getElementById('longitude').value = lng;

      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([lat, lng]).addTo(this.map).bindPopup('Lokasi dipilih').openPopup();
    });

    // Kamera
    openCamBtn.addEventListener('click', async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.video.srcObject = this.stream;
        openCamBtn.style.display = 'none';
        closeCamBtn.style.display = 'inline-block';
        snapBtn.disabled = false;
      } catch (err) {
        alert('Kamera tidak dapat diakses. Cek izin browser.');
      }
    });

    closeCamBtn.addEventListener('click', () => this._stopCamera(openCamBtn, closeCamBtn, snapBtn));

    snapBtn.addEventListener('click', () => {
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      encodedPhoto.value = dataURL;
      photoPreview.src = dataURL;
      photoPreview.style.display = 'block';
      this._stopCamera(openCamBtn, closeCamBtn, snapBtn);
    });

    // Upload file
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target.result;
        encodedPhoto.value = dataURL;
        photoPreview.src = dataURL;
        photoPreview.style.display = 'block';
        this._stopCamera(openCamBtn, closeCamBtn, snapBtn);
      };
      reader.readAsDataURL(file);
    });

    // Submit
    document.getElementById('storyForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const res = await AddStoryPresenter.submitStory(formData);

      const alert = document.getElementById('formAlert');
      alert.textContent = res.message;
      alert.style.color = res.error ? 'crimson' : 'lightgreen';

      if (!res.error) {
        e.target.reset();
        if (this.marker) this.map.removeLayer(this.marker);
        photoPreview.style.display = 'none';
      }
    });
  }

  _stopCamera(openBtn, closeBtn, snapBtn) {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.video.srcObject = null;
      this.stream = null;
    }
    openBtn.style.display = 'inline-block';
    closeBtn.style.display = 'none';
    snapBtn.disabled = true;
  }

  destroy() {
    this._stopCamera(
      document.getElementById('openCam'),
      document.getElementById('closeCam'),
      document.getElementById('snapShot')
    );
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
