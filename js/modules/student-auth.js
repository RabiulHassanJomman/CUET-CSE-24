// ===== Student Authentication Module =====
// Handles Google OAuth login for CUET students and profile management

import { getDb, getAuth } from "./firebase-helper.js";

let currentUser = null;

// Check if email is a valid CUET student email
function isValidCUETEmail(email) {
  if (!email) return false;
  // Match pattern: u<7-digit-number>@student.cuet.ac.bd
  const pattern = /^u\d{7}@student\.cuet\.ac\.bd$/i;
  return pattern.test(email);
}

// Extract student ID from email
function extractStudentId(email) {
  if (!email) return null;
  const match = email.match(/^u(\d{7})@student\.cuet\.ac\.bd$/i);
  return match ? match[1] : null;
}

// Google Sign-In
export async function signInWithGoogle() {
  try {
    const auth = await getAuth();
    const provider = new window.firebase.auth.GoogleAuthProvider();

    // Force account selection
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    // Validate CUET email
    if (!isValidCUETEmail(user.email)) {
      await auth.signOut();
      throw new Error(
        "Only CUET student emails (u<studentId>@student.cuet.ac.bd) are allowed."
      );
    }

    currentUser = user;
    await handleUserSignIn(user);
    return user;
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error;
  }
}

// Handle user sign-in
async function handleUserSignIn(user) {
  const studentId = extractStudentId(user.email);

  if (!studentId) {
    throw new Error("Could not extract student ID from email");
  }

  const db = await getDb();
  const profileRef = db.collection("profiles").doc(user.uid);

  // Check if profile exists
  const profileDoc = await profileRef.get();

  if (!profileDoc.exists) {
    // Create new profile
    await profileRef.set({
      uid: user.uid,
      email: user.email,
      studentId: studentId,
      name: user.displayName || "",
      nickname: "",
      bloodGroup: "",
      home: "",
      college: "",
      school: "",
      bio: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Show profile form for first-time users
    showProfileModal(user.uid, studentId, true);
  } else {
    // Existing user - show welcome message
    showWelcomeView(user.displayName || user.email);
  }
}

// Sign out
export async function signOut() {
  try {
    const auth = await getAuth();
    await auth.signOut();
    currentUser = null;
    showGoogleSignInView();
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
}

// Show Google Sign-In view
function showGoogleSignInView() {
  const googleView = document.getElementById("student-auth-google-view");
  const loggedinView = document.getElementById("student-auth-loggedin");

  if (googleView) googleView.style.display = "flex";
  if (loggedinView) loggedinView.style.display = "none";
}

// Show welcome view for logged-in users
function showWelcomeView(displayName) {
  const googleView = document.getElementById("student-auth-google-view");
  const loggedinView = document.getElementById("student-auth-loggedin");
  const welcomeText = document.getElementById("studentAuthWelcome");

  if (googleView) googleView.style.display = "none";
  if (loggedinView) loggedinView.style.display = "block";
  if (welcomeText) welcomeText.textContent = `Welcome, ${displayName}!`;
}

// Show profile modal
function showProfileModal(uid, studentId, isFirstTime = false) {
  const authModal = document.getElementById("studentAuthModalOverlay");
  const profileModal = document.getElementById("profileModalOverlay");

  // Close auth modal
  if (authModal) {
    authModal.classList.remove("show");
    setTimeout(() => {
      authModal.style.display = "none";
    }, 300);
  }

  // Open profile modal
  if (profileModal) {
    profileModal.style.display = "flex";
    setTimeout(() => profileModal.classList.add("show"), 10);

    // Load profile data
    loadProfileData(uid, studentId, isFirstTime);
  }
}

// Load profile data into form
async function loadProfileData(uid, studentId, isFirstTime = false) {
  try {
    const db = await getDb();
    const profileDoc = await db.collection("profiles").doc(uid).get();

    if (!profileDoc.exists) return;

    const data = profileDoc.data();

    // Populate form
    const form = document.getElementById("profileForm");
    if (form) {
      form.querySelector("#profileStudentId").value = studentId;
      form.querySelector("#profileNickname").value = data.nickname || "";
      form.querySelector("#profileName").value = data.name || "";
      form.querySelector("#profileBloodGroup").value = data.bloodGroup || "";
      form.querySelector("#profileHome").value = data.home || "";
      form.querySelector("#profileCollege").value = data.college || "";
      form.querySelector("#profileSchool").value = data.school || "";
      form.querySelector("#profileBio").value = data.bio || "";
    }

    if (isFirstTime) {
      const title = document.getElementById("profile-title");
      if (title) title.textContent = "👤 Complete Your Profile";
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

// Save profile
export async function saveProfile() {
  try {
    const auth = await getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user signed in");
    }

    const form = document.getElementById("profileForm");
    const formData = {
      nickname: form.querySelector("#profileNickname").value.trim(),
      name: form.querySelector("#profileName").value.trim(),
      bloodGroup: form.querySelector("#profileBloodGroup").value.trim(),
      home: form.querySelector("#profileHome").value.trim(),
      college: form.querySelector("#profileCollege").value.trim(),
      school: form.querySelector("#profileSchool").value.trim(),
      bio: form.querySelector("#profileBio").value.trim(),
      updatedAt: new Date().toISOString(),
    };

    const db = await getDb();
    await db.collection("profiles").doc(user.uid).update(formData);

    // Close profile modal
    closeProfileModal();

    // Show success message
    alert(
      "Profile saved successfully! Your information will be visible to other students."
    );

    // Reload the page to show updated data
    window.location.reload();
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Error saving profile: " + error.message);
  }
}

// Close profile modal
function closeProfileModal() {
  const profileModal = document.getElementById("profileModalOverlay");
  if (profileModal) {
    profileModal.classList.remove("show");
    setTimeout(() => {
      profileModal.style.display = "none";
    }, 300);
  }
}

// Open profile editor for existing users
export async function openProfileEditor() {
  const auth = await getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in first");
    return;
  }

  const studentId = extractStudentId(user.email);
  showProfileModal(user.uid, studentId, false);
}

// Check authentication state on load
export async function initializeAuth() {
  try {
    const auth = await getAuth();

    auth.onAuthStateChanged(async (user) => {
      if (user && isValidCUETEmail(user.email)) {
        currentUser = user;
        showWelcomeView(user.displayName || user.email);
      } else {
        currentUser = null;
        showGoogleSignInView();
      }
    });
  } catch (error) {
    console.error("Error initializing auth:", error);
  }
}

// Export current user getter
export function getCurrentUser() {
  return currentUser;
}
