// ===== Members Module =====
// Handles member data management, card creation, and display logic

import { getDb } from "./firebase-helper.js";
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

// Fetch member data from Firebase
export async function fetchMemberDataFromFirebase() {
  try {
    const db = await getDb();
    const profilesRef = db.collection("profiles");
    const snapshot = await profilesRef.get();

    const firebaseMembers = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      const studentId = data.studentId;

      if (studentId) {
        firebaseMembers[studentId] = {
          nickname: data.nickname || null,
          blood_group: data.bloodGroup || null,
          bio: data.bio || null,
          home: data.home || null,
          college: data.college || null,
          school: data.school || null,
          email: data.email || null,
          uid: data.uid || doc.id,
          fb_profile_link: data.facebookLink || null,
        };
      }
    });

    console.log(
      `📊 Fetched ${Object.keys(firebaseMembers).length} profiles from Firebase`
    );
    return firebaseMembers;
  } catch (error) {
    console.error("Error fetching member data from Firebase:", error);
    return {};
  }
}

// Ensure all members from students list are included
export async function ensureAllMembersFromStudents(firebaseData = {}) {
  const allMembers = [];
  const idToMember = new Map(membersArray.map((m) => [String(m.id), m]));

  // Add all IDs from 2404001 to 2404132
  for (let i = 2404001; i <= 2404132; i++) {
    const id = i.toString();
    const existingMember = idToMember.get(id);
    const firebaseMember = firebaseData[id] || {};

    if (existingMember) {
      // Merge existing member data with Firebase data (Firebase takes priority)
      allMembers.push({
        ...existingMember,
        nickname: firebaseMember.nickname || existingMember.nickname,
        blood_group: firebaseMember.blood_group || existingMember.blood_group,
        bio: firebaseMember.bio || existingMember.bio,
        home: firebaseMember.home || existingMember.home,
        college: firebaseMember.college || existingMember.college,
        school: firebaseMember.school || existingMember.school,
        email: firebaseMember.email || null,
        uid: firebaseMember.uid || null,
        fb_profile_link:
          firebaseMember.fb_profile_link || existingMember.fb_profile_link,
      });
    } else {
      // Find from studentsList
      const studentData = studentsList.find((s) => String(s.student_id) === id);

      // Create member with available data, prioritizing Firebase
      allMembers.push({
        name: studentData ? studentData.full_name : null,
        id: id,
        home: firebaseMember.home || null,
        college: firebaseMember.college || null,
        school: firebaseMember.school || null,
        bio: firebaseMember.bio || null,
        nickname: firebaseMember.nickname || null,
        blood_group: firebaseMember.blood_group || null,
        email: firebaseMember.email || null,
        uid: firebaseMember.uid || null,
        fb_profile_link: firebaseMember.fb_profile_link || null,
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

  const nickname = member.nickname || member.name || "Unknown";
  const bloodGroup = member.blood_group;

  let cardHTML = `
    <h3>${nickname}</h3>
    <p class="member-id"><span class="id-hash">#</span>${member.id}</p>
  `;

  // Add blood group with emoji only if available
  if (bloodGroup) {
    cardHTML += `<p class="member-blood">🩸 ${bloodGroup}</p>`;
  }

  card.innerHTML = cardHTML;

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
      member.blood_group || "Not specified"
    }`;
  if (modalBio) modalBio.textContent = member.bio || "No bio available";

  // Handle Facebook profile link - using only member's fb_profile_link
  if (modalFacebook) {
    if (member.fb_profile_link) {
      modalFacebook.innerHTML = `Facebook: <a href="${normalizeFacebookUrl(
        member.fb_profile_link
      )}" target="_blank" rel="noopener noreferrer">${member.nickname}</a>`;
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
export async function setupMemberSearch(firebaseData = {}) {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  const searchStats = document.getElementById("searchStats");

  if (!searchInput) return;

  // Search function
  const performSearch = async () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
      // Show all members
      const allCards = document.querySelectorAll(".member-card");
      allCards.forEach((card) => (card.style.display = ""));

      if (clearBtn) clearBtn.style.display = "none";
      if (searchStats) searchStats.textContent = "";
      return;
    }

    if (clearBtn) clearBtn.style.display = "inline-block";

    // Get all members
    const allMembers = await ensureAllMembersFromStudents(firebaseData);

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
      card.style.display = isMatch ? "" : "none";
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
