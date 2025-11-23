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
  initMembersModule,
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
function initializeMembers() {
  // Ensure all members from students list are included
  const allMembers = ensureAllMembersFromStudents();

  // Create and display member cards
  const membersContainer = document.getElementById("members");
  if (membersContainer) {
    allMembers.forEach((member) => {
      const card = createMemberCard(member);
      membersContainer.appendChild(card);
    });

    console.log(`📋 Loaded ${allMembers.length} member cards`);
  }
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
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 CUET CSE 24 - Application Starting...");

  // Initialize utilities
  const utils = initializeUtils();

  // Initialize members module with utils
  initMembersModule(utils);

  // Initialize text reveal animation
  initTextRevealAnimation();

  // Initialize member data
  initializeMembers();

  // Set up member search
  setupMemberSearch();

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
