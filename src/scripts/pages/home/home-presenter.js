import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

const HomePresenter = {
  /**
   * Mengambil daftar cerita dari API jika online,
   * jika gagal (offline), ambil dari IndexedDB.
   * @returns {Promise<object>} - Objek dengan properti error, listStory, isOffline, message
   */
  async getStories() {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return {
        error: true,
        message: 'Token tidak ditemukan. Silakan login ulang.',
      };
    }

    try {
      // Coba fetch data cerita dari API
      const response = await StoryApi.getAllStories(token);

      // Pastikan data valid dan array
      const stories = Array.isArray(response.listStory) ? response.listStory : [];

      if (stories.length === 0) {
        // Kalau API sukses tapi kosong, tetap simpan dan return
        await IdbHelper.saveMultipleStories([]);
        return {
          error: false,
          listStory: [],
          message: 'Data cerita kosong',
        };
      }

      // Simpan semua cerita ke IndexedDB (update cache)
      await IdbHelper.saveMultipleStories(stories);

      return {
        error: false,
        listStory: stories,
        isOffline: false,
        message: 'Data cerita terbaru dari server',
      };
    } catch (error) {
      // Jika gagal fetch API (misal offline), ambil data dari IndexedDB
      console.warn('Gagal fetch API, mengambil dari IndexedDB:', error.message);

      const cachedStories = await IdbHelper.getAllStories();

      if (cachedStories.length > 0) {
        return {
          error: false,
          listStory: cachedStories,
          isOffline: true,
          message: 'Menampilkan data dari cache (offline mode)',
        };
      }

      // Jika tidak ada cache sama sekali
      return {
        error: true,
        listStory: [],
        message: 'Tidak dapat mengambil data cerita. Pastikan koneksi internet Anda.',
      };
    }
  },

  /**
   * Menghapus story dari IndexedDB berdasarkan id.
   * Jika ingin sinkron ke server, bisa tambah logika fetch DELETE.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deleteStoryById(id) {
    if (!id) {
      return { error: true, message: 'ID story tidak valid' };
    }

    try {
      await IdbHelper.deleteStory(id);
      return {
        error: false,
        message: 'Story berhasil dihapus dari cache (IndexedDB)',
      };
    } catch (error) {
      console.error('Gagal menghapus story dari IndexedDB:', error);
      return {
        error: true,
        message: 'Gagal menghapus story dari IndexedDB',
      };
    }
  },
};

export default HomePresenter;
