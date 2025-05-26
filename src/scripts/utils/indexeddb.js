import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
  },
});

const IndexedDB = {
  async saveStory(story) {
    const db = await dbPromise;
    await db.put(STORE_NAME, story);
  },
  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  },
  async deleteStory(id) {
    const db = await dbPromise;
    return db.delete(STORE_NAME, id);
  },
};

export default IndexedDB;
