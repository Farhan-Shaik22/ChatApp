const DB_NAME = "ChatAppDB";
const STORE_NAME = "messages";
const DB_VERSION = 2; // Increment the version to apply schema changes

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      } else {
        const store = event.target.transaction.objectStore(STORE_NAME);
        if (!store.indexNames.contains("username")) {
          store.createIndex("username", "username", { unique: false });
        }
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) =>
      reject(new Error(`Failed to open database: ${event.target.error}`));
  });
};


// Store messages in IndexedDB
export const storeMessages = async (messages, username) => {
  let db;
  try {
    if (!Array.isArray(messages)) {
      throw new Error("Messages must be an array");
    }

    db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await Promise.all(
      messages.map((message) =>
        new Promise((resolve, reject) => {
          const request = store.put({
            ...message,
            timestamp: message.timestamp || Date.now(),
            username, // Associate with the logged-in user
          });
          request.onsuccess = resolve;
          request.onerror = reject;
        })
      )
    );

    return new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () =>
        reject(new Error(`Failed to store messages: ${transaction.error}`));
    });
  } catch (error) {
    throw new Error(`Store operation failed: ${error.message}`);
  } finally {
    if (db) db.close();
  }
};

// Retrieve messages from IndexedDB
export const retrieveMessages = async (username) => {
  let db;
  try {
    db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("username");

    return new Promise((resolve, reject) => {
      const request = index.getAll(username); // Filter messages by username

      request.onsuccess = () => {
        const messages = request.result || [];
        resolve(messages.sort((a, b) => a.timestamp - b.timestamp));
      };

      request.onerror = () =>
        reject(new Error(`Failed to retrieve messages: ${request.error}`));
    });
  } catch (error) {
    throw new Error(`Retrieve operation failed: ${error.message}`);
  } finally {
    if (db) db.close();
  }
};

