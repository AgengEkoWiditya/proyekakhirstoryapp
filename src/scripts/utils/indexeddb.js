const dbName = 'StoryAppDB';
const storeNames = {
  stories: 'stories',
  offline: 'offline-stories',
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store untuk cerita dari server
      if (!db.objectStoreNames.contains(storeNames.stories)) {
        db.createObjectStore(storeNames.stories, { keyPath: 'id' });
      }

      // Store untuk cerita yang dibuat saat offline
      if (!db.objectStoreNames.contains(storeNames.offline)) {
        db.createObjectStore(storeNames.offline, { keyPath: 'id' });
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

// --- Untuk cerita dari server ---
const getAllStories = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames.stories, 'readonly');
    const store = transaction.objectStore(storeNames.stories);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Failed to get all stories');
    };
  });
};

const saveMultipleStories = async (stories) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames.stories, 'readwrite');
    const store = transaction.objectStore(storeNames.stories);

    stories.forEach((story) => {
      store.put(story);
    });

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject('Failed to save multiple stories');
  });
};

// --- Untuk cerita buatan offline ---
const saveOfflineStory = async (story) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames.offline, 'readwrite');
    const store = transaction.objectStore(storeNames.offline);
    const request = store.put(story);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject('Failed to save offline story');
  });
};

const getOfflineStories = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames.offline, 'readonly');
    const store = transaction.objectStore(storeNames.offline);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject('Failed to get offline stories');
    };
  });
};

const deleteOfflineStory = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames.offline, 'readwrite');
    const store = transaction.objectStore(storeNames.offline);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject('Failed to delete offline story');
  });
};

// --- Untuk manipulasi umum ---
const putStory = async (story) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames.stories, 'readwrite');
    const store = transaction.objectStore(storeNames.stories);
    const request = store.put(story);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject('Failed to put story');
  });
};

const deleteStory = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames.stories, 'readwrite');
    const store = transaction.objectStore(storeNames.stories);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject('Failed to delete story');
  });
};

export default {
  // server stories
  getAllStories,
  saveMultipleStories,
  putStory,
  deleteStory,

  // offline stories
  getOfflineStories,
  saveOfflineStory,
  deleteOfflineStory,
};
