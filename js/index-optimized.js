// ===== Main Application Entry Point (Optimized) =====

import {
  actuallyCloseRoutinesModal,
  closeRoutinesModal,
  openRoutinesModal,
} from "./modules/course-resources.js";
import {
  actuallyCloseEventsModal,
  closeEventsModal,
  openEventsModal,
} from "./modules/events.js";
import {
  closeMemberModal,
  createMemberCard,
  ensureAllMembersFromStudents,
  fetchMemberDataFromFirebase,
  setupMemberSearch,
  showMemberModal,
} from "./modules/members.js";
import {
  actuallyCloseNoticeModal,
  closeNoticeModal,
  openNoticeModal,
} from "./modules/notices.js";
import {
  actuallyCloseRoutineModal,
  closeRoutineModal,
  openRoutineModal,
} from "./modules/routine.js";
import {
  initializeAuth,
  saveProfile,
  signInWithGoogle,
  signOut,
} from "./modules/student-auth.js";
import { initializeUtils } from "./modules/utils.js";

// Text reveal animation
function initTextRevealAnimation() {
  const finalText = "CUET CSE-24 signed in...";
  const textElement = document.getElementById("text");
  if (!textElement) return;

  let revealIndex = 0;
  const hexChars = "0123456789ABCDEF";

  const scrambleInterval = setInterval(() => {
    textElement.textContent = finalText
      .split("")
      .map((ch, i) => {
        if (i < revealIndex) return ch;
        return hexChars[Math.floor(Math.random() * hexChars.length)];
      })
      .join("");
  }, 50);

  function revealNextChar() {
    if (revealIndex < finalText.length) {
      revealIndex++;
      setTimeout(revealNextChar, 200);
    } else {
      clearInterval(scrambleInterval);
      textElement.textContent = finalText;
    }
  }

  setTimeout(revealNextChar, 50);
}

// Initialize member data and display
async function initializeMembers() {
  // Fetch member data from Firebase
  console.log("📡 Fetching member data from Firebase...");
  const firebaseData = await fetchMemberDataFromFirebase();

  // Ensure all members from students list are included with Firebase data
  const allMembers = await ensureAllMembersFromStudents(firebaseData);

  console.log("Debug - allMembers type:", typeof allMembers);
  console.log("Debug - allMembers is array:", Array.isArray(allMembers));
  console.log("Debug - allMembers:", allMembers);

  // Create and display member cards
  const membersContainer = document.getElementById("members");
  if (membersContainer && Array.isArray(allMembers)) {
    allMembers.forEach((member) => {
      const card = createMemberCard(member);
      membersContainer.appendChild(card);
    });

    console.log(`📋 Loaded ${allMembers.length} member cards`);
  } else {
    console.error(
      "❌ allMembers is not an array or members container not found"
    );
  }

  // Set up member search with Firebase data
  setupMemberSearch(firebaseData);
}

// Set up button event listeners
function setupButtonListeners() {
  // Course Resources button
  const routinesBtn = document.getElementById("routines-button");
  if (routinesBtn) {
    routinesBtn.addEventListener("click", openRoutinesModal);
  }

  // Class Routine button
  const routineBtn = document.getElementById("routine-button");
  if (routineBtn) {
    routineBtn.addEventListener("click", openRoutineModal);
  }

  // Events button (if exists)
  const eventsBtn = document.getElementById("events-button");
  if (eventsBtn) {
    eventsBtn.addEventListener("click", openEventsModal);
  }

  // Notice button (if exists)
  const noticeBtn = document.getElementById("notice-button");
  if (noticeBtn) {
    noticeBtn.addEventListener("click", openNoticeModal);
  }

  // Student login button
  const studentBtn = document.getElementById("student-button");
  if (studentBtn) {
    studentBtn.addEventListener("click", () => {
      const studentAuthModal = document.getElementById(
        "studentAuthModalOverlay"
      );
      if (studentAuthModal) {
        studentAuthModal.style.display = "flex";
        setTimeout(() => studentAuthModal.classList.add("show"), 10);
      }
    });
  }

  // Student auth modal close button
  const studentAuthClose = document.getElementById("studentAuthModalClose");
  if (studentAuthClose) {
    studentAuthClose.addEventListener("click", () => {
      const studentAuthModal = document.getElementById(
        "studentAuthModalOverlay"
      );
      if (studentAuthModal) {
        studentAuthModal.classList.remove("show");
        setTimeout(() => {
          studentAuthModal.style.display = "none";
        }, 300);
      }
    });
  }

  // Close student auth modal when clicking outside
  const studentAuthModal = document.getElementById("studentAuthModalOverlay");
  if (studentAuthModal) {
    studentAuthModal.addEventListener("click", (e) => {
      if (e.target === studentAuthModal) {
        studentAuthModal.classList.remove("show");
        setTimeout(() => {
          studentAuthModal.style.display = "none";
        }, 300);
      }
    });
  }

  // Google Sign-In button
  const googleSignInBtn = document.getElementById("studentAuthGoogleBtn");
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async () => {
      try {
        googleSignInBtn.disabled = true;
        googleSignInBtn.textContent = "Signing in...";
        await signInWithGoogle();
      } catch (error) {
        alert(error.message || "Sign-in failed. Please try again.");
        googleSignInBtn.disabled = false;
        googleSignInBtn.textContent = "Sign in with Google (CUET only)";
      }
    });
  }

  // Student logout button
  const studentLogoutBtn = document.getElementById("studentAuthLogoutBtn");
  if (studentLogoutBtn) {
    studentLogoutBtn.addEventListener("click", async () => {
      try {
        await signOut();
      } catch (error) {
        alert("Logout failed: " + error.message);
      }
    });
  }

  // Profile modal close button
  const profileModalClose = document.getElementById("profileModalClose");
  if (profileModalClose) {
    profileModalClose.addEventListener("click", () => {
      const profileModal = document.getElementById("profileModalOverlay");
      if (profileModal) {
        profileModal.classList.remove("show");
        setTimeout(() => {
          profileModal.style.display = "none";
        }, 300);
      }
    });
  }

  // Profile form save button
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const saveBtn = document.getElementById("profileSaveBtn");
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.textContent = "Saving...";
        }
        await saveProfile();
      } catch (error) {
        alert("Error saving profile: " + error.message);
        const saveBtn = document.getElementById("profileSaveBtn");
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Save";
        }
      }
    });
  }

  // Profile cancel button
  const profileCancelBtn = document.getElementById("profileCancelBtn");
  if (profileCancelBtn) {
    profileCancelBtn.addEventListener("click", () => {
      const profileModal = document.getElementById("profileModalOverlay");
      if (profileModal) {
        profileModal.classList.remove("show");
        setTimeout(() => {
          profileModal.style.display = "none";
        }, 300);
      }
    });
  }

  // Profile logout button
  const profileLogoutBtn = document.getElementById("profileLogoutBtn");
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to logout?")) {
        try {
          await signOut();
          const profileModal = document.getElementById("profileModalOverlay");
          if (profileModal) {
            profileModal.classList.remove("show");
            setTimeout(() => {
              profileModal.style.display = "none";
            }, 300);
          }
        } catch (error) {
          alert("Logout failed: " + error.message);
        }
      }
    });
  }

  // Close profile modal when clicking outside
  const profileModal = document.getElementById("profileModalOverlay");
  if (profileModal) {
    profileModal.addEventListener("click", (e) => {
      if (e.target === profileModal) {
        profileModal.classList.remove("show");
        setTimeout(() => {
          profileModal.style.display = "none";
        }, 300);
      }
    });
  }

  // Member modal close button
  const modalClose = document.getElementById("modalClose");
  if (modalClose) {
    modalClose.addEventListener("click", closeMemberModal);
  }

  // Close modal overlay when clicking outside
  const modalOverlay = document.getElementById("modalOverlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeMemberModal();
      }
    });
  }

  console.log("🔘 Button event listeners configured");
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 CUET CSE 24 - Application Starting...");

  // Initialize utilities
  initializeUtils();

  // Initialize authentication
  await initializeAuth();

  // Initialize text reveal animation
  initTextRevealAnimation();

  // Initialize member data (includes search setup)
  await initializeMembers();

  // Set up button event listeners
  setupButtonListeners();

  console.log("✅ Application initialized successfully!");
});

// Export functions for use in other modules
export {
  actuallyCloseEventsModal,
  actuallyCloseNoticeModal,
  actuallyCloseRoutineModal,
  actuallyCloseRoutinesModal,
  closeEventsModal,
  closeMemberModal,
  closeNoticeModal,
  closeRoutineModal,
  closeRoutinesModal,
  showMemberModal,
};
