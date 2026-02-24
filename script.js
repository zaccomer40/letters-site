// ---------------- Countdown Timer ----------------
function getNextSaturdayMidnight() {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + daysUntilSaturday);
  nextSaturday.setHours(0,0,0,0);
  return nextSaturday;
}

function updateCountdown() {
  const countdownEl = document.getElementById('countdown');
  const now = new Date();
  const target = getNextSaturdayMidnight();
  const diff = target - now;

  if (diff <= 0) {
    countdownEl.textContent = "Time's up!";
    return;
  }

  const hrs = Math.floor(diff / 1000 / 60 / 60);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  countdownEl.textContent = `${hrs}h ${mins}m ${secs}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ---------------- Utility ----------------
function getData(key, defaultValue) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue));
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------- User Sign-up ----------------
function renderParticipants() {
  const listEl = document.getElementById('participants-list');
  const participants = getData('participants', []);
  listEl.innerHTML = '';
  participants.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    listEl.appendChild(li);
  });
}

document.getElementById('signup-btn').addEventListener('click', () => {
  const name = prompt("Enter your name:");
  if (!name) return alert("Name cannot be empty.");
  const userId = 'user_' + Date.now();
  const participants = getData('participants', []);
  participants.push({ id: userId, name });
  setData('participants', participants);
  localStorage.setItem('userName', name);
  localStorage.setItem('userId', userId);
  renderParticipants();
});

renderParticipants();

// ---------------- Topic Submission ----------------
function renderTopics() {
  const topicListEl = document.getElementById('topic-list');
  const topics = getData('topics', []);
  topicListEl.innerHTML = '';
  topics.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t.text + ` (Likes: ${t.likes.length})`;
    const likeBtn = document.createElement('button');
    likeBtn.textContent = 'Like';
    likeBtn.onclick = () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return alert("Sign up first");
      if (!t.likes.includes(userId)) {
        t.likes.push(userId);
        setData('topics', topics);
        renderTopics();
      }
    };
    li.appendChild(likeBtn);
    topicListEl.appendChild(li);
  });
}

document.getElementById('submit-topic-btn').addEventListener('click', () => {
  const text = document.getElementById('topic-input').value.trim();
  if (!text) return alert("Enter a topic.");
  const userId = localStorage.getItem('userId') || 'anon_' + Date.now();
  const topics = getData('topics', []);
  topics.push({ id: 'topic_' + Date.now(), text, submittedBy: userId, likes: [] });
  setData('topics', topics);
  document.getElementById('topic-input').value = '';
  renderTopics();
});

renderTopics();

// ---------------- Admin Login ----------------
let isAdmin = false;
document.getElementById('admin-login-btn').addEventListener('click', () => {
  const pwd = prompt("Enter admin password:");
  if (pwd === "admin123") { // replace with something better for real use
    isAdmin = true;
    alert("Admin login successful!");
    document.getElementById('trigger-pairing-btn').style.display = 'inline-block';
  } else {
    alert("Wrong password");
  }
});

// ---------------- Trigger Pairing ----------------
document.getElementById('trigger-pairing-btn').addEventListener('click', () => {
  const participants = getData('participants', []);
  if (participants.length < 2) return alert("Not enough participants");

  // Shuffle array
  for (let i = participants.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participants[i], participants[j]] = [participants[j], participants[i]];
  }

  const pairings = [];
  for (let i = 0; i < participants.length; i++) {
    pairings.push({
      sender: participants[i].name,
      recipient: participants[(i + 1) % participants.length].name
    });
  }

  setData('pairings', pairings);
  renderPairings();
});

function renderPairings() {
  const listEl = document.getElementById('pairing-list');
  const pairings = getData('pairings', []);
  listEl.innerHTML = '';
  pairings.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.sender} → ${p.recipient}`;
    listEl.appendChild(li);
  });
}

renderPairings();
