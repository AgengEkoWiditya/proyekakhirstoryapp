import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

const IndexedDB = {
  async saveStory(story) {
    try {
      const db = await dbPromise;
      await db.put(STORE_NAME, story);
    } catch (error) {
      console.error('Gagal menyimpan story ke IndexedDB:', error);
    }
  },

  async getAllStories() {
    try {
      const db = await dbPromise;
      const stories = await db.getAll(STORE_NAME);
      return Array.isArray(stories) ? stories : [];
    } catch (error) {
      console.error('Gagal mengambil semua story dari IndexedDB:', error);
      return [];
    }
  },

  async deleteStory(id) {
    try {
      const db = await dbPromise;
      await db.delete(STORE_NAME, id);
      console.log(`Story dengan id ${id} berhasil dihapus dari IndexedDB`);
    } catch (error) {
      console.error('Gagal menghapus story dari IndexedDB:', error);
    }
  },
};

export default IndexedDB;
