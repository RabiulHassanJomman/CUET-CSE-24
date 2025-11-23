// ===== Main Application Entry Point =====

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
  createMemberCard,
  displaySearchResults,
  ensureAllMembersFromStudents,
  fetchMemberDataFromFirebase,
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
import { initializeUtils } from "./modules/utils.js";

// Initialize the application
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 CUET CSE 24 - Application Starting...");

  // Initialize utilities
  initializeUtils();

  // Initialize member data
  await initializeMembers();

  // Set up button event listeners
  setupButtonListeners();

  console.log("✅ Application initialized successfully!");
});

// Initialize member data and display
async function initializeMembers() {
  // Fetch member data from Firebase
  console.log("📡 Fetching member data from Firebase...");
  const firebaseData = await fetchMemberDataFromFirebase();
  
  // Ensure all members from students list are included with Firebase data
  const allMembers = await ensureAllMembersFromStudents(firebaseData);

  // Create and display member cards
  const membersContainer = document.getElementById("members-container");
  if (membersContainer) {
    allMembers.forEach((member) => {
      const card = createMemberCard(member);
      membersContainer.appendChild(card);
    });
  }

  console.log(`📋 Loaded ${allMembers.length} member cards`);
}

// Set up button event listeners
function setupButtonListeners() {
  // Events button
  document
    .getElementById("events-button")
    ?.addEventListener("click", openEventsModal);

  // Course Resources button
  document
    .getElementById("routines-button")
    ?.addEventListener("click", openRoutinesModal);

  // Notices button
  document
    .getElementById("notice-button")
    ?.addEventListener("click", openNoticeModal);

  // Class Routine button
  document
    .getElementById("routine-button")
    ?.addEventListener("click", openRoutineModal);

  console.log("🔘 Button event listeners configured");
}

// Export functions for use in other modules
export {
  actuallyCloseEventsModal,
  actuallyCloseNoticeModal,
  actuallyCloseRoutineModal,
  actuallyCloseRoutinesModal,
  closeEventsModal,
  closeNoticeModal,
  closeRoutineModal,
  closeRoutinesModal,
  displaySearchResults,
  showMemberModal,
};
