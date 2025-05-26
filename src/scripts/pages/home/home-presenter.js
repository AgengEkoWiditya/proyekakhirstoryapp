import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

function mergeStories(offlineStories, cachedStories) {
  const map = new Map();

  offlineStories.forEach((story) => map.set(story.id, story));
  cachedStories.forEach((story) => {
    if (!map.has(story.id)) {
      map.set(story.id, story);
    }
  });

  return Array.from(map.values());
}

const HomePresenter = {
  async getStories() {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return {
        error: true,
        message: 'Token tidak ditemukan. Silakan login ulang.',
        listStory: [],
      };
    }

    try {
      const response = await StoryApi.getAllStories(token);

      if (response.error) throw new Error(response.message);

      const stories = Array.isArray(response.listStory) ? response.listStory : [];

      if (stories.length > 0) {
        await IdbHelper.saveMultipleStories(stories);
      }

      const offlineStories = await IdbHelper.getOfflineStories();

      const combinedStories = mergeStories(offlineStories, stories);

      return {
        error: false,
        listStory: combinedStories,
        isOffline: false,
        message: 'Data cerita terbaru dari server',
      };
    } catch (error) {
      console.warn('Fetch API gagal, menggunakan cache:', error.message);

      const cachedStories = await IdbHelper.getAllStories();
      const offlineStories = await IdbHelper.getOfflineStories();

      const combinedStories = mergeStories(offlineStories, cachedStories);

      if (combinedStories.length > 0) {
        return {
          error: false,
          listStory: combinedStories,
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
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        return { error: true, message: 'Token tidak ditemukan. Silakan login ulang.' };
      }

      const response = await StoryApi.deleteStory(token, id);

      if (response.error) {
        return { error: true, message: response.message || 'Gagal menghapus story.' };
      }

      await IdbHelper.deleteStory(id);
      await IdbHelper.deleteOfflineStory(id);

      return { error: false, message: 'Story berhasil dihapus.' };
    } catch (error) {
      console.error('Error deleteStoryById:', error);
      return { error: true, message: 'Gagal menghapus story. Coba lagi nanti.' };
    }
  },
};

export default HomePresenter;
