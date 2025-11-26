// ===== Google Drive File Manager Module =====

// Configuration
const DRIVE_FOLDER_ID = "1yicK2IwOWPZmSLExYV4wSDW4OQIe4Ein";
const API_KEY = "AIzaSyDecWKyktxeOwWL2W6b89LrZ6mIL-uUJow"; // Google Drive API key

// State management
let currentFolderId = DRIVE_FOLDER_ID;
let folderHistory = [DRIVE_FOLDER_ID];
let folderPathNames = [{ id: DRIVE_FOLDER_ID, name: "Root" }]; // Track folder names
let allFiles = [];
let currentFiles = [];

// File type icons mapping
const fileTypeIcons = {
  folder: "📁",
  "application/pdf": "📄",
  "application/vnd.google-apps.document": "📝",
  "application/vnd.google-apps.spreadsheet": "📊",
  "application/vnd.google-apps.presentation": "📽️",
  "application/vnd.google-apps.folder": "📁",
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  "image/gif": "🖼️",
  "video/mp4": "🎥",
  "video/quicktime": "🎥",
  "application/zip": "📦",
  "application/x-zip-compressed": "📦",
  "text/plain": "📃",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📝",
  "application/vnd.ms-excel": "📊",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "application/vnd.ms-powerpoint": "📽️",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "📽️",
};

// Get file icon based on MIME type
function getFileIcon(mimeType, isFolder) {
  if (isFolder || mimeType === "application/vnd.google-apps.folder") {
    return "📁";
  }
  return fileTypeIcons[mimeType] || "📄";
}

// Format file size
function formatFileSize(bytes) {
  if (!bytes || bytes === "0") return "-";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Fetch files from Google Drive
export async function fetchDriveFiles(folderId = DRIVE_FOLDER_ID) {
  try {
    const query = `'${folderId}' in parents and trashed=false`;
    const fields =
      "files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&fields=${fields}&key=${API_KEY}&orderBy=folder,name`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error fetching Drive files:", error);
    return [];
  }
}

// Render breadcrumb navigation
function renderBreadcrumb() {
  const breadcrumbContainer = document.querySelector(".drive-breadcrumb");
  if (!breadcrumbContainer) return;

  // Build breadcrumb with full path
  let breadcrumbHTML = folderPathNames
    .map((folder, index) => {
      const isLast = index === folderPathNames.length - 1;
      const activeClass = isLast ? " active" : "";
      const folderName = folder.name || "Folder";

      return `<span class="breadcrumb-item${activeClass}" data-folder-index="${index}">📁 ${folderName}</span>`;
    })
    .join(' <span class="breadcrumb-separator">></span> ');

  breadcrumbContainer.innerHTML = breadcrumbHTML;

  // Add click listeners for navigation
  breadcrumbContainer.querySelectorAll(".breadcrumb-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = parseInt(item.dataset.folderIndex);
      if (index < folderPathNames.length - 1) {
        navigateToFolderByIndex(index);
      }
    });
  });
}

// Render files list
export function renderFilesList(files) {
  const filesListContainer = document.getElementById("drive-files-list");
  if (!filesListContainer) return;

  if (!files || files.length === 0) {
    filesListContainer.innerHTML =
      '<div class="drive-empty">No files found in this folder.</div>';
    return;
  }

  currentFiles = files;

  const filesHTML = files
    .map((file) => {
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
      const icon = getFileIcon(file.mimeType, isFolder);
      const size = formatFileSize(file.size);
      const date = formatDate(file.modifiedTime);

      return `
      <div class="drive-file-item ${
        isFolder ? "folder" : "file"
      }" data-file-id="${file.id}" data-is-folder="${isFolder}">
        <div class="file-icon">${icon}</div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">
            <span class="file-size">${size}</span>
            <span class="file-date">Modified: ${date}</span>
          </div>
        </div>
        <div class="file-actions">
          ${
            isFolder
              ? '<button class="drive-action-btn open-folder-btn" title="Open folder">📂 Open</button>'
              : `<a href="${file.webViewLink}" target="_blank" rel="noopener noreferrer" class="drive-action-btn view-file-btn" title="View file">👁️ View</a>`
          }
        </div>
      </div>
    `;
    })
    .join("");

  filesListContainer.innerHTML = filesHTML;

  // Add event listeners for folder navigation
  filesListContainer
    .querySelectorAll(".drive-file-item.folder")
    .forEach((folderItem) => {
      folderItem.addEventListener("click", (e) => {
        if (!e.target.closest(".drive-action-btn")) {
          const folderId = folderItem.dataset.fileId;
          const folderName = folderItem.querySelector(".file-name").textContent;
          openFolder(folderId, folderName);
        }
      });
    });

  // Add event listeners for open folder buttons
  filesListContainer.querySelectorAll(".open-folder-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const folderItem = btn.closest(".drive-file-item");
      const folderId = folderItem.dataset.fileId;
      const folderName = folderItem.querySelector(".file-name").textContent;
      openFolder(folderId, folderName);
    });
  });
}

// Open folder
export async function openFolder(folderId, folderName = "Folder") {
  showLoading();
  currentFolderId = folderId;
  folderHistory.push(folderId);
  folderPathNames.push({ id: folderId, name: folderName });

  const files = await fetchDriveFiles(folderId);
  allFiles = files;
  renderFilesList(files);
  renderBreadcrumb();
  updateBackButton();
  hideLoading();
}

// Navigate back
export function navigateBack() {
  if (folderHistory.length > 1) {
    folderHistory.pop();
    folderPathNames.pop();
    currentFolderId = folderHistory[folderHistory.length - 1];
    loadCurrentFolder();
  }
}

// Navigate to root
export function navigateToRoot() {
  folderHistory = [DRIVE_FOLDER_ID];
  folderPathNames = [{ id: DRIVE_FOLDER_ID, name: "Root" }];
  currentFolderId = DRIVE_FOLDER_ID;
  loadCurrentFolder();
}

// Navigate to folder by breadcrumb index
function navigateToFolderByIndex(index) {
  if (index < 0 || index >= folderPathNames.length) return;

  // Trim history to the clicked folder
  folderHistory = folderHistory.slice(0, index + 1);
  folderPathNames = folderPathNames.slice(0, index + 1);
  currentFolderId = folderHistory[folderHistory.length - 1];
  loadCurrentFolder();
}

// Load current folder
export async function loadCurrentFolder() {
  showLoading();
  const files = await fetchDriveFiles(currentFolderId);
  allFiles = files;
  renderFilesList(files);
  renderBreadcrumb();
  updateBackButton();
  hideLoading();
}

// Update back button state
function updateBackButton() {
  const backBtn = document.getElementById("drive-back-btn");
  if (backBtn) {
    backBtn.disabled = folderHistory.length <= 1;
  }
}

// Search files
export function searchFiles(query) {
  if (!query.trim()) {
    renderFilesList(allFiles);
    return;
  }

  const searchQuery = query.toLowerCase();
  const filteredFiles = allFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery)
  );

  renderFilesList(filteredFiles);
}

// Show loading state
function showLoading() {
  const filesListContainer = document.getElementById("drive-files-list");
  if (filesListContainer) {
    filesListContainer.innerHTML =
      '<div class="drive-loading">⏳ Loading files...</div>';
  }
}

// Hide loading state (handled by renderFilesList)
function hideLoading() {
  // Loading is automatically hidden when renderFilesList is called
}

// Initialize file manager
export async function initDriveFileManager() {
  // Check if API key is configured
  if (API_KEY === "YOUR_GOOGLE_API_KEY") {
    const filesListContainer = document.getElementById("drive-files-list");
    if (filesListContainer) {
      filesListContainer.innerHTML = `
        <div class="drive-error">
          <h3>⚠️ Configuration Required</h3>
          <p>To use the Google Drive file manager, you need to:</p>
          <ol>
            <li>Create a Google Cloud Project</li>
            <li>Enable the Google Drive API</li>
            <li>Create an API Key with Drive API access</li>
            <li>Update the API_KEY in drive-file-manager.js</li>
          </ol>
          <p>For now, you can view files directly at:</p>
          <a href="https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}" target="_blank" rel="noopener noreferrer" class="drive-direct-link">
            📁 Open in Google Drive
          </a>
        </div>
      `;
    }
    return;
  }

  // Load initial files
  showLoading();
  const files = await fetchDriveFiles(DRIVE_FOLDER_ID);
  allFiles = files;
  renderFilesList(files);
  renderBreadcrumb();
  updateBackButton();

  // Set up event listeners
  const backBtn = document.getElementById("drive-back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", navigateBack);
  }

  const refreshBtn = document.getElementById("drive-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadCurrentFolder);
  }

  const searchInput = document.getElementById("drive-search");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchFiles(e.target.value);
      }, 300);
    });
  }
}

// Reset file manager state
export function resetDriveFileManager() {
  currentFolderId = DRIVE_FOLDER_ID;
  folderHistory = [DRIVE_FOLDER_ID];
  allFiles = [];
  currentFiles = [];

  const searchInput = document.getElementById("drive-search");
  if (searchInput) {
    searchInput.value = "";
  }
}
