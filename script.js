// ---------------- Firebase Setup ----------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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

// ---------------- User Sign-up ----------------
function getLocalUser() {
  return localStorage.getItem('userName');
}

function renderParticipants() {
  const listEl = document.getElementById('participants-list');
  db.ref('participants').once('value', snapshot => {
    const participants = snapshot.val() || {};
    listEl.innerHTML = '';
    Object.values(participants).forEach(p => {
      const li = document.createElement('li');
      li.textContent = p.name;
      listEl.appendChild(li);
    });
  });
}

document.getElementById('signup-btn').addEventListener('click', () => {
  let name = prompt("Enter your name:");
  if (!name) return alert("Name cannot be empty.");
  const userId = 'user_' + Date.now();
  localStorage.setItem('userName', name);
  localStorage.setItem('userId', userId);
  db.ref('participants/' + userId).set({ name });
  renderParticipants();
});

renderParticipants();

// ---------------- Topic Submission ----------------
function renderTopics() {
  const topicListEl = document.getElementById('topic-list');
  db.ref('topics').once('value', snapshot => {
    const topics = snapshot.val() || {};
    topicListEl.innerHTML = '';
    Object.entries(topics).forEach(([id, t]) => {
      const li = document.createElement('li');
      li.textContent = t.text + ` (Likes: ${t.likes ? t.likes.length : 0})`;
      const likeBtn = document.createElement('button');
      likeBtn.textContent = 'Like';
      likeBtn.onclick = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return alert("Sign up first");
        const likes = t.likes || [];
        if (!likes.includes(userId)) {
          likes.push(userId);
          db.ref('topics/' + id + '/likes').set(likes);
          renderTopics();
        }
      };
      li.appendChild(likeBtn);
      topicListEl.appendChild(li);
    });
  });
}

document.getElementById('submit-topic-btn').addEventListener('click', () => {
  const text = document.getElementById('topic-input').value.trim();
  if (!text) return alert("Enter a topic.");
  const userId = localStorage.getItem('userId') || 'anon_' + Date.now();
  const topicId = 'topic_' + Date.now();
  db.ref('topics/' + topicId).set({
    text,
    submittedBy: userId,
    likes: []
  });
  document.getElementById('topic-input').value = '';
  renderTopics();
});

renderTopics();

// ---------------- Admin Login ----------------
let isAdmin = false;
document.getElementById('admin-login-btn').addEventListener('click', () => {
  const pwd = prompt("Enter admin password:");
  if (pwd === "admin123") { // replace with more secure method
    isAdmin = true;
    alert("Admin login successful!");
    document.getElementById('trigger-pairing-btn').style.display = 'inline-block';
  } else {
    alert("Wrong password");
  }
});

// ---------------- Trigger Pairing ----------------
document.getElementById('trigger-pairing-btn').addEventListener('click', () => {
  db.ref('participants').once('value', snapshot => {
    const participants = snapshot.val() || {};
    const userIds = Object.keys(participants);
    if (userIds.length < 2) return alert("Not enough participants");

    // Shuffle
    for (let i = userIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [userIds[i], userIds[j]] = [userIds[j], userIds[i]];
    }

    const pairings = [];
    for (let i = 0; i < userIds.length; i++) {
      pairings.push({
        sender: participants[userIds[i]].name,
        recipient: participants[userIds[(i+1)%userIds.length]].name
      });
    }

    db.ref('pairings').set(pairings);
    renderPairings();
  });
});

function renderPairings() {
  const listEl = document.getElementById('pairing-list');
  db.ref('pairings').once('value', snapshot => {
    const pairings = snapshot.val() || [];
    listEl.innerHTML = '';
    pairings.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.sender} → ${p.recipient}`;
      listEl.appendChild(li);
    });
  });
}

renderPairings();
