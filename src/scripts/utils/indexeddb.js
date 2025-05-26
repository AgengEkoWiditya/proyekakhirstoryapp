import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

const IndexedDB = {
  /**
   * Simpan atau perbarui satu story ke IndexedDB.
   * @param {Object} story - Data story yang akan disimpan.
   */
  async saveStory(story) {
    try {
      const db = await dbPromise;
      await db.put(STORE_NAME, story);
    } catch (error) {
      console.error('[IndexedDB] Gagal menyimpan story:', error);
    }
  },

  /**
   * Simpan atau perbarui beberapa story sekaligus.
   * @param {Array<Object>} stories - Array story dari API.
   */
  async saveMultipleStories(stories) {
    try {
      const db = await dbPromise;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const story of stories) {
        tx.store.put(story);
      }
      await tx.done;
    } catch (error) {
      console.error('[IndexedDB] Gagal menyimpan beberapa story:', error);
    }
  },

  /**
   * Ambil semua data story dari IndexedDB.
   * @returns {Promise<Array>} Array story.
   */
  async getAllStories() {
    try {
      const db = await dbPromise;
      return await db.getAll(STORE_NAME);
    } catch (error) {
      console.error('[IndexedDB] Gagal mengambil stories:', error);
      return [];
    }
  },

  /**
   * Hapus satu story berdasarkan ID.
   * @param {string} id - ID story yang akan dihapus.
   */
  async deleteStory(id) {
    try {
      const db = await dbPromise;
      await db.delete(STORE_NAME, id);
    } catch (error) {
      console.error('[IndexedDB] Gagal menghapus story:', error);
    }
  },

  /**
   * Hapus semua story dari IndexedDB (opsional).
   */
  async clearAllStories() {
    try {
      const db = await dbPromise;
      await db.clear(STORE_NAME);
    } catch (error) {
      console.error('[IndexedDB] Gagal menghapus semua stories:', error);
    }
  },
};

export default IndexedDB;
