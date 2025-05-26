import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

const AddStoryPresenter = {
  async submitStory(formData) {
    try {
      const token = localStorage.getItem('authToken');
      const base64 = formData.get('photoData');
      let photoBlob = null;

      if (base64) {
        photoBlob = await (await fetch(base64)).blob();
        formData.delete('photoData');
        formData.append('photo', photoBlob, 'photo.jpg');
      }

      // Kirim ke server
      const response = await StoryApi.addStory(formData, token);

      if (!response.error && photoBlob) {
        // Promisify FileReader agar bisa await
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
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

        await IdbHelper.putStory(storyData);
      }

      return response;
    } catch (error) {
      // Simpan lokal saat offline
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
