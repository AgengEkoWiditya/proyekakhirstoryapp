import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

const AddStoryPresenter = {
  async submitStory(formData) {
    try {
      const token = localStorage.getItem('authToken');
      const base64 = formData.get('photoData');
      let photoBlob = null;

      if (base64) {
        // Jika base64 sudah lengkap (data:image/jpeg;base64,...) maka fetch berhasil
        photoBlob = await (await fetch(base64)).blob();
        formData.delete('photoData');
        formData.append('photo', photoBlob, 'photo.jpg');
      }

      // Kirim ke server
      const response = await StoryApi.addStory(formData, token);

      if (!response.error && photoBlob) {
        // Ubah Blob jadi base64 lengkap dengan prefix
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result); // ini sudah termasuk prefix data:image/jpeg;base64,...
          reader.onerror = () => reject(new Error('Failed to read photo blob'));
          reader.readAsDataURL(photoBlob);
        });

        const storyData = {
          id: response.story?.id || `local-${Date.now()}`,
          name: formData.get('name') || 'Anonim',
          description: formData.get('description') || '',
          photoUrl: base64Image,
          createdAt: new Date().toISOString(),
          lat: parseFloat(formData.get('lat')) || null,
          lon: parseFloat(formData.get('lon')) || null,
        };

        // Simpan ke IndexedDB (offline cache)
        await IdbHelper.putStory(storyData);
      }

      return response;
    } catch (error) {
      // Saat gagal (offline), simpan data ke offline store dengan photoUrl lengkap prefix base64
      const fallbackId = `local-${Date.now()}`;
      let photoData = formData.get('photoData') || 'default.jpg';

      // Pastikan base64 offline juga punya prefix 'data:image/jpeg;base64,' jika belum ada
      if (photoData && !photoData.startsWith('data:image')) {
        photoData = `data:image/jpeg;base64,${photoData}`;
      }

      const storyData = {
        id: fallbackId,
        name: formData.get('name') || 'Anonim',
        description: formData.get('description') || '',
        photoUrl: photoData,
        createdAt: new Date().toISOString(),
        lat: parseFloat(formData.get('lat')) || null,
        lon: parseFloat(formData.get('lon')) || null,
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
