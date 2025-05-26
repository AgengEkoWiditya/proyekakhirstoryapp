import StoryApi from '../../data/story-api';

const HomePresenter = {
  async getStories() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { error: true, message: 'Token tidak ditemukan. Silakan login ulang.' };
    }

    return await StoryApi.getAllStories(token);
  }
};

export default HomePresenter;
