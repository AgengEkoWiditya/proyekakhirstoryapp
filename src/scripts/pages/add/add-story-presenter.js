import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

const AddStoryPresenter = {
  async submitStory(formData) {
    const token = localStorage.getItem('authToken');
    let photoBlob = null;
    let base64Image = formData.get('photoData');

    try {
      if (base64Image) {
        photoBlob = await (await fetch(base64Image)).blob();
        formData.delete('photoData');
        formData.append('photo', photoBlob, 'photo.jpg');
      }

      // Kirim ke server
      const response = await StoryApi.addStory(formData, token);

      if (!response.error && photoBlob) {
        // Ubah Blob jadi base64 lengkap dengan prefix
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read photo blob'));
          reader.readAsDataURL(photoBlob);
        });
      }

      // Simpan ke IndexedDB, baik saat online maupun offline
      const storyData = {
        id: response.story?.id || `local-${Date.now()}`,
        name: formData.get('name') || 'Anonim',
        description: formData.get('description') || '',
        photoUrl: base64Image,
        createdAt: new Date().toISOString(),
        lat: parseFloat(formData.get('lat')) || null,
        lon: parseFloat(formData.get('lon')) || null,
        isOffline: !!response.error, // tandai apakah offline atau online
      };

      if (response.error) {
        // Jika gagal online, simpan di offline store
        await IdbHelper.saveOfflineStory(storyData);
      } else {
        // Jika sukses, simpan di cache store (bisa juga hapus di offline store jika ada)
        await IdbHelper.putStory(storyData);
        await IdbHelper.deleteOfflineStory(storyData.id); // bersihkan jika pernah disimpan offline
      }

      return response;
    } catch (error) {
      // Saat error network, simpan di offline store
      const fallbackId = `local-${Date.now()}`;

      // Pastikan base64 lengkap
      if (base64Image && !base64Image.startsWith('data:image')) {
        base64Image = `data:image/jpeg;base64,${base64Image}`;
      }

      const storyData = {
        id: fallbackId,
        name: formData.get('name') || 'Anonim',
        description: formData.get('description') || '',
        photoUrl: base64Image,
        createdAt: new Date().toISOString(),
        lat: parseFloat(formData.get('lat')) || null,
        lon: parseFloat(formData.get('lon')) || null,
        isOffline: true,
      };

      await IdbHelper.saveOfflineStory(storyData);

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
