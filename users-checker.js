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

// --- Data Fetching ---
const usersRef = ref(db, 'users'); 
onValue(usersRef, (snapshot) => {
    allUsers = snapshot.val() || {};
    console.log("Data loaded successfully");
    renderUsers(allUsers);
});

// --- UI Rendering ---
function renderUsers(data) {
    const list = document.getElementById('userList');
    if (!list) return;
    list.innerHTML = "";
    let count = 0;

    Object.keys(data).forEach(uid => {
        const u = data[uid];
        count++;
        const dep = u.wallet?.deposit || 0;
        const win = u.wallet?.winnings || 0;
        
        const card = `
            <div class="user-card">
                <div class="user-info" onclick="openUserPopup('${uid}')" style="cursor:pointer; flex-grow:1;">
                    <b>${u.username || 'No Name'}</b> <span class="gn-badge">${u.gameName || 'N/A'}</span>
                    <div style="font-size:12px; color:#888; margin-top:5px;">
                        <i class="far fa-envelope"></i> ${u.email || 'No Email'}
                    </div>
                    <div style="margin-top:8px; font-size:13px;">
                        <span style="color:green">DEP: ₹${dep}</span> | 
                        <span style="color:#f1c40f">WIN: ₹${win}</span>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteUser('${uid}', '${u.username}')" style="background:none; border:none; color:red; cursor:pointer; padding:10px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
        list.insertAdjacentHTML('beforeend', card);
    });
    document.getElementById('totalCount').innerText = `Total: ${count}`;
}
window.openUserPopup = (uid) => {
    selectedUid = uid;
    const u = allUsers[uid];
    if (!u) return;

    document.getElementById('popUserName').innerText = u.username || 'User';
    document.getElementById('popUserUid').innerText = `UID: ${uid}`;
    document.getElementById('editDeposit').value = u.wallet?.deposit || 0;
    document.getElementById('editWinnings').value = u.wallet?.winnings || 0;
    
    // --- TRANSACTION & MATCH LINKS UPDATE ---
    // Ith vazhi puthiya page-ilekku UID pass cheyyaam
    document.getElementById('matchLink').href = `match-details.html?uid=${uid}`;
    document.getElementById('transLink').href = `transaction-history.html?uid=${uid}`;
    
    const banBtn = document.getElementById('banActionBtn');
    const isBanned = u.status === 'Banned';
    banBtn.innerHTML = isBanned ? '<i class="fas fa-user-check"></i><span>Unban</span>' : '<i class="fas fa-user-slash"></i><span>Ban</span>';
    
    banBtn.onclick = () => handleBan(isBanned ? 'Active' : 'Banned');
    document.getElementById('userModal').style.display = 'flex';
};


window.closePopup = () => {
    document.getElementById('userModal').style.display = 'none';
};

window.deleteUser = async (uid, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        try {
            await remove(ref(db, `users/${uid}`));
            alert("User deleted!");
        } catch (error) {
            console.error(error);
        }
    }
};

window.updateWallet = async () => {
    const deposit = parseInt(document.getElementById('editDeposit').value) || 0;
    const winnings = parseInt(document.getElementById('editWinnings').value) || 0;
    
    try {
        await update(ref(db, `users/${selectedUid}/wallet`), { deposit, winnings });
        alert("Wallet Updated Successfully!");
        window.closePopup();
    } catch (error) {
        alert("Update failed: " + error.message);
    }
};

const handleBan = async (status) => {
    try {
        await update(ref(db, `users/${selectedUid}`), { status });
        window.closePopup();
    } catch (error) {
        console.error(error);
    }
};

// --- Search Event Listener ---
document.getElementById('searchInput').addEventListener('input', () => {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('searchType').value;
    const filtered = {};
    
    Object.keys(allUsers).forEach(uid => {
        const val = (allUsers[uid][type] || "").toString().toLowerCase();
        if (val.includes(query)) {
            filtered[uid] = allUsers[uid];
        }
    });
    renderUsers(filtered);
});
