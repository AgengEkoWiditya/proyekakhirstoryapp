import StoryApi from '../../data/story-api';
import IdbHelper from '../../utils/indexeddb';

const AddStoryPresenter = {
  async submitStory(formData) {
    try {
      const token = localStorage.getItem('authToken');

      const base64 = formData.get('photoData');
      let photoBlob;

      if (base64) {
        photoBlob = await (await fetch(base64)).blob();
        formData.delete('photoData');
        formData.append('photo', photoBlob, 'photo.jpg');
      }

      const response = await StoryApi.addStory(formData, token);

      if (!response.error && photoBlob) {
        const reader = new FileReader();

        reader.onload = async function () {
          const base64Image = reader.result;

          const storyData = {
            id: `local-${Date.now()}`, 
            name: formData.get('name') || 'Anonim',
            description: formData.get('description') || '',
            photo: base64Image,
            createdAt: new Date().toISOString(),
            lat: parseFloat(formData.get('lat')) || null,
            lon: parseFloat(formData.get('lon')) || null,
          };

          await IdbHelper.putStory(storyData);
        };

        reader.readAsDataURL(photoBlob);
      }

      return response;
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  },
};

export default AddStoryPresenter;
