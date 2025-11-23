// ===== Firebase Helper Module =====
// Centralized Firebase SDK loading and initialization

// Lazy load Firebase SDK
async function ensureFirebaseLoaded() {
  if (window.firebase) return true;

  return new Promise((resolve, reject) => {
    const appScript = document.createElement("script");
    appScript.src =
      "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js";
    appScript.onload = () => {
      const firestoreScript = document.createElement("script");
      firestoreScript.src =
        "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js";
      firestoreScript.onload = () => resolve(true);
      firestoreScript.onerror = () =>
        reject(new Error("Failed to load Firebase Firestore"));
      document.head.appendChild(firestoreScript);
    };
    appScript.onerror = () => reject(new Error("Failed to load Firebase App"));
    document.head.appendChild(appScript);
  });
}

// Get Firestore instance from window (initialized by Firebase SDK)
export async function getDb() {
  if (!window.db) {
    await ensureFirebaseLoaded();
    if (window.firebase && window.__firebaseConfig) {
      try {
        if (!window.firebase.apps || window.firebase.apps.length === 0) {
          window.firebase.initializeApp(window.__firebaseConfig);
        }
        window.db = window.firebase.firestore();
        try {
          window.db.enablePersistence({ synchronizeTabs: true });
        } catch (_) {
          // Persistence may fail in some browsers
        }
      } catch (e) {
        console.error("Failed to initialize Firebase:", e);
      }
    }
  }
  return window.db;
}
