import StoryApi from '../../data/story-api';
import IndexedDB from '../../utils/indexeddb';

const HomePresenter = {
  async getStories() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { error: true, message: 'Token tidak ditemukan. Silakan login ulang.' };
    }

    try {
      // Ambil dari API
      const response = await StoryApi.getAllStories(token);

      // Asumsikan response mengandung listStory sebagai array cerita
      const stories = response.listStory || [];

      if (Array.isArray(stories)) {
        // Simpan semua ke IndexedDB (gunakan Promise.all agar semua tersimpan sebelum lanjut)
        await Promise.all(stories.map((story) => IndexedDB.saveStory(story)));
        return { error: false, listStory: stories };
      } else {
        console.warn('Data dari API bukan array:', response);
        return { error: true, message: 'Data dari API tidak valid' };
      }
    } catch (error) {
      console.warn('Gagal fetch API, ambil dari IndexedDB:', error.message);

      // Ambil dari IndexedDB jika gagal
      const stories = await IndexedDB.getAllStories();

      if (Array.isArray(stories)) {
        return { error: false, listStory: stories };
      } else {
        console.error('Data dari IndexedDB bukan array:', stories);
        return { error: true, message: 'Data dari IndexedDB tidak valid' };
      }
    }
  },
};

export default HomePresenter;
