import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
    authDomain: "studio-4988500581-b9772.firebaseapp.com",
    databaseURL: "https://studio-4988500581-b9772-default-rtdb.firebaseio.com",
    projectId: "studio-4988500581-b9772",
    storageBucket: "studio-4988500581-b9772.firebasestorage.app",
    messagingSenderId: "773461302160",
    appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let allUsers = {};
let selectedUid = "";
let showingDupes = false;

// --- Data Fetching ---
const usersRef = ref(db, 'users'); 
onValue(usersRef, (snapshot) => {
    allUsers = snapshot.val() || {};
    refreshUI();
});

// Logic to decide what to show
function refreshUI() {
    if (showingDupes) {
        renderUsers(getDuplicateFilter(allUsers));
    } else {
        renderUsers(allUsers);
    }
}

// Duplicate Finding Logic
function getDuplicateFilter(data) {
    const counts = {};
    const filtered = {};
    // Game Name based duplicate count
    Object.values(data).forEach(u => {
        const val = (u.gameName || u.username || "").toString().toLowerCase().trim();
        if (val) counts[val] = (counts[val] || 0) + 1;
    });
    // Duplicate aaya usersine mathram filter cheyyunnu
    Object.keys(data).forEach(uid => {
        const u = data[uid];
        const val = (u.gameName || u.username || "").toString().toLowerCase().trim();
        if (counts[val] > 1) filtered[uid] = u;
    });
    return filtered;
}

// --- UI Rendering ---
function renderUsers(data) {
    const list = document.getElementById('userList');
    if (!list) return;
    list.innerHTML = "";
    let count = 0;

    const nameCounts = {};
    Object.values(allUsers).forEach(u => {
        const n = (u.gameName || u.username || "").toLowerCase().trim();
        if(n) nameCounts[n] = (nameCounts[n] || 0) + 1;
    });

    Object.keys(data).forEach(uid => {
        const u = data[uid];
        count++;
        const dep = u.wallet?.deposit || 0;
        const win = u.wallet?.winnings || 0;
        
        let cardBg = "background: #fff;"; 
        let borderStyle = "border: 1px solid #ddd;";
        const currentName = (u.gameName || u.username || "").toLowerCase().trim();

        // Status Based Styling
        if (u.status === 'Banned') {
            cardBg = "background: #ffebee;"; 
            borderStyle = "border: 2px solid #f44336;"; 
        } else {
            if (nameCounts[currentName] === 2) borderStyle = "border: 2px solid orange;";
            if (nameCounts[currentName] > 2) borderStyle = "border: 2px solid #e91e63;";
        }

        const card = `
            <div class="user-card" style="${cardBg} ${borderStyle} margin: 10px; border-radius: 8px; padding: 10px; display: flex; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div class="user-info" onclick="openUserPopup('${uid}')" style="cursor:pointer; flex-grow:1;">
                    <b style="${u.status === 'Banned' ? 'color:#d32f2f;' : ''}">${u.username || 'No Name'}</b> 
                    <span class="gn-badge" style="background:#eee; padding:2px 5px; border-radius:4px; font-size:11px;">${u.gameName || 'N/A'}</span>
                    ${u.status === 'Banned' ? '<span style="color:red; font-weight:bold; font-size:10px;"> [BANNED]</span>' : ''}
                    ${nameCounts[currentName] > 1 ? `<span style="color:#e91e63; font-weight:bold; font-size:10px;"> (Dup: ${nameCounts[currentName]})</span>` : ''}
                    <div style="font-size:12px; color:#666; margin-top:5px;">
                        <i class="far fa-envelope"></i> ${u.email || 'No Email'}
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteUser('${uid}', '${u.username}')" style="background:none; border:none; color:#f44336; cursor:pointer; padding:10px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
        list.insertAdjacentHTML('beforeend', card);
    });
    document.getElementById('totalCount').innerText = `Total: ${count}`;
}

// --- Duplicate Button Click Event ---
document.getElementById('showDupesBtn').addEventListener('click', () => {
    showingDupes = !showingDupes;
    const btn = document.getElementById('showDupesBtn');
    
    if (showingDupes) {
        btn.innerText = "SHOW ALL PLAYERS";
        btn.classList.add('active');
        renderUsers(getDuplicateFilter(allUsers));
    } else {
        btn.innerText = "SHOW DUPLICATES";
        btn.classList.remove('active');
        renderUsers(allUsers);
    }
});

// --- Modal & Global Functions ---
window.openUserPopup = (uid) => {
    selectedUid = uid;
    const u = allUsers[uid];
    if (!u) return;
    document.getElementById('popUserName').innerText = u.username || 'User';
    document.getElementById('popUserUid').innerText = `UID: ${uid}`;
    document.getElementById('editDeposit').value = u.wallet?.deposit || 0;
    document.getElementById('editWinnings').value = u.wallet?.winnings || 0;
    document.getElementById('matchLink').href = `match-details.html?uid=${uid}`;
    document.getElementById('transLink').href = `transaction-history.html?uid=${uid}`;
    const banBtn = document.getElementById('banActionBtn');
    const isBanned = u.status === 'Banned';
    banBtn.innerHTML = isBanned ? '<i class="fas fa-user-check"></i><span>Unban</span>' : '<i class="fas fa-user-slash"></i><span>Ban</span>';
    banBtn.onclick = () => handleBan(isBanned ? 'Active' : 'Banned');
    document.getElementById('userModal').style.display = 'flex';
};

window.closePopup = () => { document.getElementById('userModal').style.display = 'none'; };

window.deleteUser = async (uid, name) => {
    if (confirm(`Delete ${name}?`)) {
        try { await remove(ref(db, `users/${uid}`)); } catch (e) { console.error(e); }
    }
};

window.updateWallet = async () => {
    const deposit = parseInt(document.getElementById('editDeposit').value) || 0;
    const winnings = parseInt(document.getElementById('editWinnings').value) || 0;
    try {
        await update(ref(db, `users/${selectedUid}/wallet`), { deposit, winnings });
        alert("Wallet Updated!");
        window.closePopup();
    } catch (e) { alert("Error: " + e.message); }
};

const handleBan = async (status) => {
    try {
        await update(ref(db, `users/${selectedUid}`), { status });
        window.closePopup();
    } catch (e) { console.error(e); }
};

// --- Search Event ---
document.getElementById('searchInput').addEventListener('input', () => {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const type = document.getElementById('searchType').value;
    showingDupes = false; 
    document.getElementById('showDupesBtn').innerText = "SHOW DUPLICATES";
    
    const filtered = {};
    Object.keys(allUsers).forEach(uid => {
        const val = (allUsers[uid][type] || "").toString().toLowerCase();
        if (val.includes(query)) filtered[uid] = allUsers[uid];
    });
    renderUsers(filtered);
});
