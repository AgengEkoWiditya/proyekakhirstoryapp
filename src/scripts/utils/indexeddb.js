const dbName = 'StoryAppDB'; 
const storeName = 'stories';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Failed to open IndexedDB');
    };
  });
};

const getAllStories = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Failed to get all stories');
    };
  });
};

// Fungsi tambahan yang dicari: getOfflineStories
const getOfflineStories = async () => {
  return getAllStories(); // alias
};

// Fungsi tambahan yang dicari: saveMultipleStories
const saveMultipleStories = async (stories) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    stories.forEach((story) => {
      store.put(story);
    });

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject('Failed to save multiple stories');
  });
};

const putStory = async (story) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(story);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject('Failed to put story');
    };
  });
};

const deleteStory = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject('Failed to delete story');
    };
  });
};

export default {
  getAllStories,
  putStory,
  deleteStory,
  getOfflineStories, // tambahkan ini
  saveMultipleStories, // tambahkan ini
};
