const dbName = 'StoryAppDB';
const dbVersion = 1;
const storeNames = {
  stories: 'stories',
  offline: 'offline-stories',
  favorites: 'favorites',
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(storeNames.stories)) {
        db.createObjectStore(storeNames.stories, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(storeNames.offline)) {
        db.createObjectStore(storeNames.offline, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(storeNames.favorites)) {
        db.createObjectStore(storeNames.favorites, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(new Error('Failed to open IndexedDB: ' + event.target.errorCode));
    };
  });
};

// ---------- Store stories dari server ----------
const getAllStories = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.stories, 'readonly');
    const store = tx.objectStore(storeNames.stories);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('Failed to get all stories'));
  });
};

const saveMultipleStories = async (stories) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.stories, 'readwrite');
    const store = tx.objectStore(storeNames.stories);

    stories.forEach((story) => store.put(story));

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(new Error('Failed to save multiple stories'));
  });
};

const putStory = async (story) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.stories, 'readwrite');
    const store = tx.objectStore(storeNames.stories);
    const req = store.put(story);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(new Error('Failed to put story'));
  });
};

const deleteStory = async (id) => {
  const db = await openDB();

  try {
    await deleteOfflineStory(id);
  } catch (err) {
    console.warn('Gagal hapus offline story:', err);
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.stories, 'readwrite');
    const store = tx.objectStore(storeNames.stories);
    const req = store.delete(id);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(new Error('Failed to delete story'));
  });
};

// ---------- Store cerita offline ----------
const getOfflineStories = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.offline, 'readonly');
    const store = tx.objectStore(storeNames.offline);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('Failed to get offline stories'));
  });
};

const saveOfflineStory = async (story) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.offline, 'readwrite');
    const store = tx.objectStore(storeNames.offline);
    const req = store.put(story);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(new Error('Failed to save offline story'));
  });
};

const deleteOfflineStory = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.offline, 'readwrite');
    const store = tx.objectStore(storeNames.offline);
    const req = store.delete(id);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(new Error('Failed to delete offline story'));
  });
};

// ---------- Store favorit ----------
const saveFavorite = async (story) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.favorites, 'readwrite');
    const store = tx.objectStore(storeNames.favorites);
    const req = store.put(story);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(new Error('Failed to save favorite story'));
  });
};

const getFavoriteStories = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.favorites, 'readonly');
    const store = tx.objectStore(storeNames.favorites);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('Failed to get favorite stories'));
  });
};

const deleteFavorite = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames.favorites, 'readwrite');
    const store = tx.objectStore(storeNames.favorites);
    const req = store.delete(id);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(new Error('Failed to delete favorite story'));
  });
};

export default {
  getAllStories,
  saveMultipleStories,
  putStory,
  deleteStory,

  getOfflineStories,
  saveOfflineStory,
  deleteOfflineStory,

  saveFavorite,
  getFavoriteStories,
  deleteFavorite,
};
