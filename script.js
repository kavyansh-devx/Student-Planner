const monthYear = document.getElementById("monthYear");
const dates = document.getElementById("dates");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const today = new Date();

    dates.innerHTML = "";

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    monthYear.innerText = `${monthNames[month]} ${year}`;

    for (let i = 0; i < firstDay; i++) {
        dates.innerHTML += `<div></div>`;
    }

    for (let i = 1; i <= lastDate; i++) {
        const isToday =
            i === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        dates.innerHTML += `<div class="${isToday ? "today" : ""}">${i}</div>`;
    }
}

prev.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

next.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();

/* Clock */
const hourBox = document.querySelector("#hours");
const minBox = document.querySelector("#minutes");

function updateClock() {
    const now = new Date();
    hourBox.innerText = String(now.getHours()).padStart(2, "0");
    minBox.innerText = String(now.getMinutes()).padStart(2, "0");
}

updateClock();
setInterval(updateClock, 1000);

/* Timer */
let timerSeconds = 0;
let timerInterval = null;

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    document.querySelector(".timer h1").innerText =
        `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function startTimer() {
    if (timerInterval !== null) return;
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    timerSeconds = 0;
    updateTimerDisplay();
}

const playBtn = document.querySelector("#play");
const pauseBtn = document.querySelector("#pause");
const restartBtn = document.querySelector("#restart");

playBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", stopTimer);
restartBtn.addEventListener("click", resetTimer);

/* Tasks */
const subjects = document.querySelectorAll(".box");
const notesList = document.getElementById("notes");
const popupBox = document.querySelector(".popupBox");
const closeBtn = document.querySelector(".close");
let activeSubjectIndex = 0;

const defaultNoteItemHTML = `
<input type="checkbox">
<span contenteditable="true">&nbsp;</span>
<button class="delete">❌</button>
`;

const defaultNoteItem = `<li>${defaultNoteItemHTML}</li>`;

function getStorageKey(index) {
    return `todo-${index}`;
}

function updateCounter() {
    const total = notesList.querySelectorAll("li").length;
    const completed = notesList.querySelectorAll("li.done").length;

    const activeCounter = subjects[activeSubjectIndex]?.querySelector(".counter");
    if (activeCounter) {
        activeCounter.innerText = `Tasks: ${completed}/${total}`;
    }
}

function loadNotesForSubject(index) {
    activeSubjectIndex = index;
    const key = getStorageKey(index);
    notesList.innerHTML = localStorage.getItem(key) || defaultNoteItem;
    updateCounter();
}

function saveNotes() {
    const key = getStorageKey(activeSubjectIndex);
    localStorage.setItem(key, notesList.innerHTML);
    updateCounter();
}

const main = document.querySelector(".main");

function openPopupForSubject(index) {
    loadNotesForSubject(index);
    popupBox.style.display = "block";
    setTimeout(() => popupBox.classList.add("show"), 10);
    if (main) main.style.filter = "blur(4px)";
}

subjects.forEach((box, index) => {
    box.addEventListener("click", () => openPopupForSubject(index));
});

closeBtn.addEventListener("click", () => {
    popupBox.classList.remove("show");
    setTimeout(() => {
        popupBox.style.display = "none";
    }, 300);
    if (main) main.style.filter = "";
    saveNotes();
});

notesList.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (e.target.tagName !== "SPAN") return;

    e.preventDefault();

    const li = document.createElement("li");
    li.innerHTML = defaultNoteItemHTML;
    li.style.opacity = "0";
    notesList.appendChild(li);

    setTimeout(() => {
        li.style.opacity = "1";
    }, 50);
    li.querySelector("span").focus();
    saveNotes();
});

notesList.addEventListener("change", (e) => {
    if (e.target.type !== "checkbox") return;
    e.target.parentElement.classList.toggle("done");
    saveNotes();
});

notesList.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete")) return;
    e.target.parentElement.remove();
    saveNotes();
});

notesList.addEventListener("input", saveNotes);

/* Initialize subject counters */
subjects.forEach((_, index) => {
    const saved = localStorage.getItem(getStorageKey(index));
    if (!saved) return;

    const temp = document.createElement("div");
    temp.innerHTML = saved;
    const total = temp.querySelectorAll("li").length;
    const completed = temp.querySelectorAll("li.done").length;
    const counter = subjects[index].querySelector(".counter");
    if (counter) counter.innerText = `Tasks: ${completed}/${total}`;
});

/* Ensure timer starts at 00:00 */
updateTimerDisplay();

/* Links */
const linkLabelInput = document.getElementById("linkLabel");
const linkUrlInput = document.getElementById("linkUrl");
const addLinkBtn = document.getElementById("addLink");
const linksList = document.getElementById("linksList");

function normalizeUrl(raw) {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (trimmed.match(/^https?:\/\//)) return trimmed;
    return `https://${trimmed}`;
}

function getSavedLinks() {
    try {
        return JSON.parse(localStorage.getItem("favLinks") || "[]");
    } catch {
        return [];
    }
}

function saveLinks(links) {
    localStorage.setItem("favLinks", JSON.stringify(links));
    renderLinks(links);
}

function renderLinks(links) {
    linksList.innerHTML = "";

    links.forEach((link, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="${link.url}" target="_blank" rel="noopener">${link.label || link.url}</a>
            <button class="delete-link" data-index="${index}">❌</button>
        `;
        linksList.appendChild(li);
    });
}

function addLink() {
    const label = linkLabelInput.value.trim();
    const url = normalizeUrl(linkUrlInput.value);
    if (!url) return;

    const links = getSavedLinks();
    links.push({ label, url });
    saveLinks(links);

    linkLabelInput.value = "";
    linkUrlInput.value = "";
    linkUrlInput.focus();
}

addLinkBtn.addEventListener("click", addLink);

linkUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addLink();
});

linksList.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete-link")) return;
    const index = Number(e.target.dataset.index);
    const links = getSavedLinks();
    links.splice(index, 1);
    saveLinks(links);
});

renderLinks(getSavedLinks());