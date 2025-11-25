// ===== Firebase Helper Module =====
// Centralized Firebase SDK loading and initialization

// Lazy load Firebase SDK
async function ensureFirebaseLoaded() {
  if (window.firebase && window.firebase.auth) return true;

  return new Promise((resolve, reject) => {
    const appScript = document.createElement("script");
    appScript.src =
      "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js";
    appScript.onload = () => {
      const firestoreScript = document.createElement("script");
      firestoreScript.src =
        "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js";
      firestoreScript.onload = () => {
        const authScript = document.createElement("script");
        authScript.src =
          "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js";
        authScript.onload = () => resolve(true);
        authScript.onerror = () =>
          reject(new Error("Failed to load Firebase Auth"));
        document.head.appendChild(authScript);
      };
      firestoreScript.onerror = () =>
        reject(new Error("Failed to load Firebase Firestore"));
      document.head.appendChild(firestoreScript);
    };
    appScript.onerror = () => reject(new Error("Failed to load Firebase App"));
    document.head.appendChild(appScript);
  });
}

// Initialize Firebase if not already done
async function initializeFirebase() {
  await ensureFirebaseLoaded();
  if (window.firebase && window.__firebaseConfig) {
    if (!window.firebase.apps || window.firebase.apps.length === 0) {
      window.firebase.initializeApp(window.__firebaseConfig);
    }
  }
}

// Get Firestore instance
export async function getDb() {
  if (!window.db) {
    await initializeFirebase();
    if (window.firebase) {
      try {
        window.db = window.firebase.firestore();
        // Note: Persistence is enabled by default in modern Firebase versions
      } catch (e) {
        console.error("Failed to initialize Firestore:", e);
      }
    }
  }
  return window.db;
}

// Get Auth instance
export async function getAuth() {
  await initializeFirebase();
  if (!window.firebase || !window.firebase.auth) {
    throw new Error("Firebase Auth not loaded");
  }
  return window.firebase.auth();
}
