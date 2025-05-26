const StoryApi = {
  async addStory(formData, token) {
    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorRes = await res.json();
        throw new Error(errorRes.message || 'Failed to add story');
      }

      return res.json();
    } catch (error) {
      return { error: true, message: error.message };
    }
  },

  async getAllStories(token) {
    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorRes = await res.json();
        throw new Error(errorRes.message || 'Failed to fetch stories');
      }

      return res.json();
    } catch (error) {
      return { error: true, message: error.message };
    }
  },
};

export default StoryApi;
