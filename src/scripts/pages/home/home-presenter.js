import StoryApi from '../../data/story-api';
import IndexedDB from '../utils/indexeddb.js';

const HomePresenter = {
  async getStories() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { error: true, message: 'Token tidak ditemukan. Silakan login ulang.' };
    }

    try {
      // Ambil dari API
      const stories = await StoryApi.getAllStories(token);

      // Simpan semua ke IndexedDB
      stories.forEach((story) => IndexedDB.saveStory(story));

      return stories;
    } catch (error) {
      console.warn('Gagal fetch API, ambil dari IndexedDB:', error.message);

      // Ambil dari IndexedDB jika gagal
      const stories = await IndexedDB.getAllStories();
      return stories;
    }
  },
};

export default HomePresenter;
