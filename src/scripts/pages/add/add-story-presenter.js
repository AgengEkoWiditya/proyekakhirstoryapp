import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

const AddStoryPresenter = {
  async submitStory(formData) {
    try {
      const token = localStorage.getItem('authToken');
      const base64 = formData.get('photoData');
      let photoBlob = null;

      // Ubah base64 ke Blob jika ada
      if (base64) {
        photoBlob = await (await fetch(base64)).blob();
        formData.delete('photoData');
        formData.append('photo', photoBlob, 'photo.jpg');
      }

      // Kirim ke server
      const response = await StoryApi.addStory(formData, token);

      // Simpan ke IndexedDB jika berhasil dan ada foto
      if (!response.error && photoBlob) {
        const reader = new FileReader();
        reader.onload = async function () {
          const base64Image = reader.result;

          const storyData = {
            id: response.story?.id || `local-${Date.now()}`, // Ambil ID dari server jika tersedia
            name: formData.get('name') || 'Anonim',
            description: formData.get('description') || '',
            photoUrl: base64Image,
            createdAt: new Date().toISOString(),
            lat: parseFloat(formData.get('lat')) || null,
            lon: parseFloat(formData.get('lon')) || null,
          };

          await IdbHelper.putStory(storyData);
        };
        reader.readAsDataURL(photoBlob);
      }

      return response;
    } catch (error) {
      // Jika gagal, tetap simpan ke IndexedDB untuk mode offline
      const fallbackId = `local-${Date.now()}`;
      const storyData = {
        id: fallbackId,
        name: formData.get('name') || 'Anonim',
        description: formData.get('description') || '',
        photoUrl: formData.get('photoData') || 'default.jpg',
        createdAt: new Date().toISOString(),
        lat: parseFloat(formData.get('lat')) || null,
        lon: parseFloat(formData.get('lon')) || null,
      };

      await IdbHelper.putStory(storyData);

      return {
        error: true,
        isOffline: true,
        message: 'Gagal terhubung ke server. Cerita disimpan secara lokal.',
        localId: fallbackId,
      };
    }
  },
};

export default AddStoryPresenter;
