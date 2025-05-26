import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

const HomePresenter = {
  async getStories() {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return {
        error: true,
        message: 'Token tidak ditemukan. Silakan login ulang.',
      };
    }

    try {
      const response = await StoryApi.getAllStories(token);
      const stories = Array.isArray(response.listStory) ? response.listStory : [];

      await IdbHelper.saveMultipleStories(stories);

      return {
        error: false,
        listStory: stories,
        isOffline: false,
        message: 'Data cerita terbaru dari server',
      };
    } catch (error) {
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

      return {
        error: true,
        listStory: [],
        message: 'Tidak dapat mengambil data cerita. Pastikan koneksi internet Anda.',
      };
    }
  },

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

  async syncOfflineStories() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[Sync] Token tidak ditemukan');
      return;
    }

    try {
      const offlineStories = await IdbHelper.getOfflineStories();

      if (!offlineStories.length) {
        console.info('[Sync] Tidak ada cerita offline untuk disinkronkan');
        return;
      }

      for (const story of offlineStories) {
        try {
          const formData = new FormData();
          formData.append('description', story.description);
          formData.append('photo', story.photo);
          if (story.lat) formData.append('lat', story.lat);
          if (story.lon) formData.append('lon', story.lon);

          await StoryApi.addNewStory(token, formData);
          await IdbHelper.deleteOfflineStory(story.id);
          console.log(`[Sync] Story ID ${story.id} berhasil disinkron`);
        } catch (err) {
          console.warn(`[Sync] Gagal kirim story ID ${story.id}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[Sync] Gagal sinkronisasi offline stories:', err.message);
    }
  },
};

export default HomePresenter;
