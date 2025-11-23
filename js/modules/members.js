// ===== Members Module =====
// Handles member data management, card creation, and display logic

import { membersArray, studentsList } from "./members-data.js";
import { preventMainPageScroll, restoreMainPageScroll } from "./utils.js";

// Facebook URL normalization
export function normalizeFacebookUrl(rawUrl) {
  if (!rawUrl) return "";

  let url = rawUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}

// Ensure all members from students list are included
export function ensureAllMembersFromStudents() {
  const allMembers = [];
  const idToMember = new Map(membersArray.map((m) => [String(m.id), m]));

  // Add all IDs from 2404001 to 2404132
  for (let i = 2404001; i <= 2404132; i++) {
    const id = i.toString();
    const existingMember = idToMember.get(id);

    if (existingMember) {
      // Use existing member data
      allMembers.push(existingMember);
    } else {
      // Find from studentsList
      const studentData = studentsList.find((s) => String(s.student_id) === id);

      // Create member with available data
      allMembers.push({
        name: studentData ? studentData.full_name : null,
        id: id,
        home: null,
        college: null,
        school: null,
        bio: null,
        nickname: null,
        bloodGroup: null,
        fb_profile_link: null,
      });
    }
  }

  return allMembers;
}

// Member card creation
export function createMemberCard(member) {
  const card = document.createElement("div");
  card.className = "member-card";
  card.setAttribute("data-id", member.id);

  const displayName = member.nickname || member.name || "Unknown";

  card.innerHTML = `
    <div class="member-avatar">
      <span>${displayName.charAt(0).toUpperCase()}</span>
    </div>
    <div class="member-info">
      <h3>${displayName}</h3>
      <p>ID: ${member.id}</p>
    </div>
  `;

  card.addEventListener("click", () => showMemberModal(member));
  return card;
}

// Member modal display
export function showMemberModal(member) {
  const modal = document.getElementById("modalOverlay");
  if (!modal) return;

  const modalName = document.getElementById("modalName");
  const modalId = document.getElementById("modalId");
  const modalHome = document.getElementById("modalHome");
  const modalCollege = document.getElementById("modalCollege");
  const modalSchool = document.getElementById("modalSchool");
  const modalFacebook = document.getElementById("modalFacebook");
  const modalBlood = document.getElementById("modalBlood");
  const modalBio = document.getElementById("modalBio");

  if (modalName) modalName.textContent = member.name || "Unknown";
  if (modalId) modalId.textContent = `ID: ${member.id}`;
  if (modalHome)
    modalHome.textContent = `Home: ${member.home || "Not specified"}`;
  if (modalCollege)
    modalCollege.textContent = `College: ${member.college || "Not specified"}`;
  if (modalSchool)
    modalSchool.textContent = `School: ${member.school || "Not specified"}`;
  if (modalBlood)
    modalBlood.textContent = `Blood Group: ${
      member.bloodGroup || "Not specified"
    }`;
  if (modalBio) modalBio.textContent = member.bio || "No bio available";

  // Handle Facebook profile link - using only member's fb_profile_link
  if (modalFacebook) {
    if (member.fb_profile_link) {
      modalFacebook.innerHTML = `Facebook: <a href="${normalizeFacebookUrl(
        member.fb_profile_link
      )}" target="_blank" rel="noopener noreferrer">Profile Link</a>`;
    } else {
      modalFacebook.textContent = "Facebook: No profile link";
    }
  }

  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);

  preventMainPageScroll();
}

// Close member modal
export function closeMemberModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }

  restoreMainPageScroll();
}

// Search functionality
export function setupMemberSearch() {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  const searchStats = document.getElementById("searchStats");

  if (!searchInput) return;

  // Search function
  const performSearch = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
      // Show all members
      const allCards = document.querySelectorAll(".member-card");
      allCards.forEach((card) => (card.style.display = "block"));

      if (clearBtn) clearBtn.style.display = "none";
      if (searchStats) searchStats.textContent = "";
      return;
    }

    if (clearBtn) clearBtn.style.display = "inline-block";

    // Get all members
    const allMembers = ensureAllMembersFromStudents();

    // Search in members
    const results = allMembers.filter((member) => {
      const id = member.id.toLowerCase();
      const name = (member.name || "").toLowerCase();
      const nickname = (member.nickname || "").toLowerCase();
      const home = (member.home || "").toLowerCase();
      const college = (member.college || "").toLowerCase();
      const school = (member.school || "").toLowerCase();
      const bio = (member.bio || "").toLowerCase();
      const blood = (member.bloodGroup || "").toLowerCase();

      return (
        id.includes(searchTerm) ||
        name.includes(searchTerm) ||
        nickname.includes(searchTerm) ||
        home.includes(searchTerm) ||
        college.includes(searchTerm) ||
        school.includes(searchTerm) ||
        bio.includes(searchTerm) ||
        blood.includes(searchTerm)
      );
    });

    // Update visibility of member cards
    const allCards = document.querySelectorAll(".member-card");
    allCards.forEach((card) => {
      const cardId = card.getAttribute("data-id");
      const isMatch = results.some((member) => member.id === cardId);
      card.style.display = isMatch ? "block" : "none";
    });

    // Update search stats
    if (searchStats) {
      searchStats.textContent = `Found ${results.length} member${
        results.length !== 1 ? "s" : ""
      }`;
    }
  };

  // Event listeners
  searchInput.addEventListener("input", performSearch);

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      performSearch();
    });
  }
}

// Export data for other modules
export { membersArray, studentsList };
