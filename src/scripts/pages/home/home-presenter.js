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
      const stories = response.listStory;

      if (Array.isArray(stories)) {
        stories.forEach((story) => IndexedDB.saveStory(story));
        return stories;
      } else {
        console.warn('Data listStory bukan array:', stories);
        return [];
      }
    } catch (error) {
      console.warn('Gagal fetch API, ambil dari IndexedDB:', error.message);

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
