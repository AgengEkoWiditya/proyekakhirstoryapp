import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

const HomePresenter = {
  async getStories() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { error: true, message: 'Token tidak ditemukan. Silakan login ulang.' };
    }

    try {
      // Ambil data dari API
      const response = await StoryApi.getAllStories(token);
      const stories = response.listStory || [];

      if (!Array.isArray(stories)) {
        return { error: true, message: 'Data dari API tidak valid' };
      }

      // Simpan semua story ke IndexedDB
      await Promise.all(stories.map((story) => IdbHelper.putStory(story)));

      return { error: false, listStory: stories };
    } catch (error) {
      // Gagal fetch API => ambil dari IndexedDB
      console.warn('Gagal fetch API, ambil dari IndexedDB:', error.message);
      const stories = await IdbHelper.getAllStories();
      return {
        error: false,
        listStory: stories,
        isOffline: true,
        message: 'Menampilkan data dari cache (offline mode)',
      };
    }
  },

  async deleteStoryById(id) {
    try {
      await IdbHelper.deleteStory(id);
      return { error: false, message: 'Story berhasil dihapus dari cache (IndexedDB)' };
    } catch (error) {
      console.error('Gagal menghapus story dari IndexedDB:', error);
      return { error: true, message: 'Gagal menghapus story dari IndexedDB' };
    }
  },
};

export default HomePresenter;
