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
      const stories = await StoryApi.getAllStories(token);

      // Pastikan stories adalah array
      if (Array.isArray(stories)) {
        // Simpan semua ke IndexedDB
        stories.forEach((story) => IndexedDB.saveStory(story));
      } else {
        console.warn('Data dari API bukan array:', stories);
      }

      return stories;
    } catch (error) {
      console.warn('Gagal fetch API, ambil dari IndexedDB:', error.message);

      // Ambil dari IndexedDB jika gagal
      const stories = await IndexedDB.getAllStories();

      if (Array.isArray(stories)) {
        return stories;
      } else {
        console.error('Data dari IndexedDB bukan array:', stories);
        return [];
      }
    }
  },
};

export default HomePresenter;
