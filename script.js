const button = document.getElementById("generateBtn");
const mediaDisplay = document.getElementById("mediaDisplay");
const clock = document.getElementById("clock");

const filterButtons = document.querySelectorAll(".filter-button");
const selectedTypesLabel = document.getElementById("selectedTypes");
const poolCountLabel = document.getElementById("poolCount");
const scrambleBtn = document.getElementById("scrambleBtn");
const VIDEO_BASE_URL = "https://pub-b451e30866da4a9a8921a93d1cf4638d.r2.dev/";

let mediaLibrary = {
  photo: [],
  video: [],
  audio: [],
  all: []
};

let scrambleMode = false;

const activeFilters = new Set(["photo", "video", "audio"]);
let lastSelectedFile = null;

function toggleScrambleMode() {
  scrambleMode = !scrambleMode;

  console.log("Scramble mode:", scrambleMode);

  if (scrambleBtn) {
    scrambleBtn.classList.toggle("is-active", scrambleMode);
  }
}

async function loadMediaList() {
  try {
    const res = await fetch("media.json");

    if (!res.ok) {
      throw new Error(`Failed to load media.json (${res.status})`);
    }

    const data = await res.json();

    mediaLibrary = {
      photo: Array.isArray(data.photo) ? data.photo : [],
      video: Array.isArray(data.video) ? data.video : [],
      audio: Array.isArray(data.audio) ? data.audio : [],
      all: Array.isArray(data.all) ? data.all : []
    };

    updateFilterUI();
    updatePoolInfo();

    if (mediaLibrary.all.length === 0) {
      mediaDisplay.innerHTML = `<div class="media-error">No media files found.</div>`;
    } else {
      mediaDisplay.innerHTML = `<div class="media-placeholder">READY // PRESS GENERATE</div>`;
    }

    console.log("Loaded media library:", mediaLibrary);
  } catch (err) {
    console.error("Failed to load media list:", err);
    mediaDisplay.innerHTML = `<div class="media-error">Could not load media list.</div>`;
  }
}



function getActivePool() {
  const pool = [];

  if (activeFilters.has("photo")) {
    pool.push(...mediaLibrary.photo);
  }

  if (activeFilters.has("video")) {
    pool.push(...mediaLibrary.video);
  }

  if (activeFilters.has("audio")) {
    pool.push(...mediaLibrary.audio);
  }

  return pool;
}

function updatePoolInfo() {
  const activeList = Array.from(activeFilters);

  if (selectedTypesLabel) {
    selectedTypesLabel.textContent =
      activeList.length > 0 ? activeList.join(" + ").toUpperCase() : "NONE";
  }

  if (poolCountLabel) {
    poolCountLabel.textContent = String(getActivePool().length);
  }
}

function updateFilterUI() {
  filterButtons.forEach((btn) => {
    const type = btn.dataset.type;
    const isActive = activeFilters.has(type);

    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function toggleFilter(type) {
  if (activeFilters.has(type)) {
    activeFilters.delete(type);
  } else {
    activeFilters.add(type);
  }

  updateFilterUI();
  updatePoolInfo();

  if (getActivePool().length === 0) {
    mediaDisplay.innerHTML = `<div class="media-error">No filters selected.</div>`;
  }
}

function generateRandomMedia() {
  console.log("generateRandomMedia fired");

  const pool = getActivePool();

  if (pool.length === 0) {
    mediaDisplay.innerHTML = `<div class="media-error">Select at least one filter.</div>`;
    return;
  }

  let selectedFile;

  if (pool.length === 1) {
    selectedFile = pool[0];
  } else {
    do {
      const randomIndex = Math.floor(Math.random() * pool.length);
      selectedFile = pool[randomIndex];
    } while (selectedFile === lastSelectedFile);
  }

  lastSelectedFile = selectedFile;

  console.log("Active filters:", Array.from(activeFilters));
  console.log("Pool size:", pool.length);
  console.log("Selected file:", selectedFile);

  const extension = selectedFile.split(".").pop().toLowerCase();
  
  if (["mp4", "mov"].includes(extension)) {
    displayMedia(VIDEO_BASE_URL + encodeURIComponent(selectedFile));
  } else {
    displayMedia(`media/${selectedFile}`);
  }
}

function clearCurrentMedia() {
  const existingVideo = mediaDisplay.querySelector("video");
  const existingAudio = mediaDisplay.querySelector("audio");

  if (existingVideo) {
    existingVideo.pause();
    existingVideo.removeAttribute("src");
    existingVideo.load();
  }

  if (existingAudio) {
    existingAudio.pause();
    existingAudio.removeAttribute("src");
    existingAudio.load();
  }

  mediaDisplay.innerHTML = "";
}

function displayMedia(path) {
  clearCurrentMedia();

  const extension = path.split(".").pop().toLowerCase();

  if (["jpg", "jpeg", "png"].includes(extension)) {
    const img = document.createElement("img");
    img.src = path;
    img.alt = "Generated media";
    mediaDisplay.appendChild(img);
    return;
  }

  if (["mp4", "mov"].includes(extension)) {
    const video = document.createElement("video");
    video.src = path;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.autoplay = true;
    video.muted = false;

    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    mediaDisplay.appendChild(video);

    // 🔥 THIS IS THE KEY PART
    video.addEventListener("loadedmetadata", () => {
        if (scrambleMode && video.duration) {
        const randomTime = Math.random() * video.duration;

        console.log("Starting video at:", randomTime.toFixed(2));

        video.currentTime = randomTime;
        }
    });

    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise.catch((error) => {
        console.error("Video play failed, retrying muted:", error);
        video.muted = true;
        video.play().catch((err) => {
            console.error("Muted play failed:", err);
        });
        });
    }

    return;
    }

  if (extension === "wav") {
    const audio = document.createElement("audio");
    audio.src = path;
    audio.autoplay = true;
    audio.controls = true;

    mediaDisplay.appendChild(audio);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Audio play failed:", error);
      });
    }
    return;
  }

  mediaDisplay.innerHTML = `<div class="media-error">Unsupported file type: ${extension}</div>`;
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  clock.textContent = `${hours}:${minutes}:${seconds}`;
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    toggleFilter(btn.dataset.type);
  });
});

if (scrambleBtn) {
  scrambleBtn.addEventListener("click", toggleScrambleMode);
} else {
  console.error("scrambleBtn not found");
}

button.addEventListener("click", generateRandomMedia);

updateClock();
setInterval(updateClock, 1000);
loadMediaList();
