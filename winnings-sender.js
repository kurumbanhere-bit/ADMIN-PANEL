// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
    authDomain: "studio-4988500581-b9772.firebaseapp.com",
    databaseURL: "https://studio-4988500581-b9772-default-rtdb.firebaseio.com",
    projectId: "studio-4988500581-b9772",
    storageBucket: "studio-4988500581-b9772.firebasestorage.app",
    messagingSenderId: "773461302160",
    appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- MULTI-SELECT & LONG PRESS VARIABLES ---
let selectedMatches = []; 
let longPressTimer;
let isSelectMode = false;

// --- SELECTION LOGIC ---
function startPress(id, el) {
    longPressTimer = setTimeout(() => {
        isSelectMode = true; 
        toggleSelect(id, el);
    }, 800);
}

function endPress() {
    clearTimeout(longPressTimer);
}

function handleCardClick(id, el) {
    if (isSelectMode) {
        toggleSelect(id, el);
    } else {
        window.location.href = `card.html?id=${id}`;
    }
}

function toggleSelect(id, el) {
    const index = selectedMatches.indexOf(id);
    if (index > -1) {
        selectedMatches.splice(index, 1);
        el.style.border = "none";
        el.style.borderLeft = "5px solid #ff4d4d";
        el.style.background = "#fff";
    } else {
        selectedMatches.push(id);
        el.style.border = "2px solid #2ecc71";
        el.style.background = "#eafff0";
    }
    
    if (selectedMatches.length === 0) isSelectMode = false;
    updateFloatingButton();
}

function updateFloatingButton() {
    const btn = document.getElementById('floatingAssignBtn');
    const countSpan = document.getElementById('selectCount');
    if (selectedMatches && selectedMatches.length > 0) {
        btn.style.display = "block";
        countSpan.innerText = selectedMatches.length;
    } else {
        btn.style.display = "none";
    }
}

// --- HOST MODAL & ASSIGNMENT ---
function openHostModal() {
    const modal = document.getElementById('hostModal');
    const container = document.getElementById('hostListContainer');
    modal.style.display = "block";
    container.innerHTML = "<p style='text-align:center; padding:10px;'>Loading Hosts...</p>";

    db.ref('approved_hosts').once('value', (snap) => {
        container.innerHTML = "";
        snap.forEach(child => {
            const name = child.val().username || child.val().email;
            container.innerHTML += `
                <div class="host-item" onclick="assignToAll('${name}')" style="padding:12px; border-bottom:1px solid #eee; cursor:pointer; display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-user-check" style="color:green"></i> ${name}
                </div>`;
        });
    });
}

async function assignToAll(hostName) {
    if (selectedMatches.length === 0) return;
    const updates = {};
    selectedMatches.forEach(id => {
        updates[`matches/${id}/assignedHost`] = hostName;
    });

    try {
        await db.ref().update(updates);
        alert(`${selectedMatches.length} matches assigned to ${hostName}`);
        selectedMatches = [];
        isSelectMode = false;
        closeModal();
        updateFloatingButton();
        loadActiveMatches();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

function closeModal() {
    document.getElementById('hostModal').style.display = "none";
}

// --- CATEGORY CHANGE LOGIC ---
function changeCat(cat, el) {
    const catInput = document.getElementById('mCategory');
    if(catInput) catInput.value = cat;
    document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    autoSetSlots(); 
    loadActiveMatches(); 
}

function autoSetSlots() {
    const maxInput = document.getElementById('mMax');
    if(maxInput) maxInput.value = 48; 
}

function previewThumbnail() {
    const url = document.getElementById('mImageFile').value;
    const preview = document.getElementById('imagePreview');
    const text = document.getElementById('uploadText');
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        if(text) text.style.display = 'none';
    } else {
        preview.style.display = 'none';
        if(text) text.style.display = 'block';
    }
}

function addRankField() {
    const container = document.getElementById('prizeContainer');
    const row = document.createElement('div');
    row.className = "prize-row";
    row.style = "display: flex; gap: 5px; margin-bottom: 5px;";
    row.innerHTML = `
        <input type="text" class="rank-label" placeholder="Rank (eg: 1)" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:5px;">
        <input type="text" class="rank-value" placeholder="Prize (eg: 100)" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:5px;">
    `;
    container.appendChild(row);
}

// --- MAIN PUBLISH FUNCTION ---
async function publishMatch() {
    const btn = document.getElementById('publishBtn');
    const category = document.getElementById('mCategory').value;
    const teamType = document.getElementById('mTeamType').value;
    const image = document.getElementById('mImageFile').value;
    const map = document.getElementById('mMap').value;
    const startTime = document.getElementById('mTime').value;
    const entry = document.getElementById('mEntry').value;
    const prize = document.getElementById('mPrize').value;
    const max = document.getElementById('mMax').value;
    const rules = document.getElementById('mRules').value;
    const rulesArray = rules ? rules.split(',').map(r => r.trim()).filter(r => r !== "") : [];
    
    const prizeData = [];
    document.querySelectorAll('.prize-row').forEach(row => {
        const rank = row.querySelector('.rank-label').value;
        const val = row.querySelector('.rank-value').value;
        if(rank && val) prizeData.push({ rank: rank, prize: val });
    });

    const count = parseInt(document.getElementById('mCount').value) || 1;
    const gap = parseInt(document.getElementById('mGap').value) || 15;

    if (!startTime) return alert("Dayaayi time select cheyyuka!");

    btn.disabled = true;
    btn.innerText = "Publishing...";

    try {
        let baseTime = new Date(startTime);
        for (let i = 0; i < count; i++) {
            let matchTime = new Date(baseTime.getTime() + (i * gap * 60000));
            const matchData = {
                category, teamType, image, map,
                time: matchTime.toISOString(),
                entry: parseInt(entry),
                totalPrize: parseInt(prize),
                maxSlots: parseInt(max),
                rules: rulesArray,
                prizes: prizeData,
                status: "UPCOMING",
                joined: 0,
                assignedHost: "Not Assigned"
            };
            await db.ref('matches').push(matchData);
        }
        alert(`${count} Match(es) successfully published!`);
        location.reload(); 
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "PUBLISH MATCH(ES)";
    }
}

// --- UPDATED LOAD ACTIVE MATCHES WITH 12H TIME ---
function loadActiveMatches() {
    const selectedCategory = document.getElementById('mCategory').value;
    const filterDate = document.getElementById('filterDate').value; 

    db.ref('matches').on('value', snap => {
        const list = document.getElementById('adminMatchList');
        if(!list) return;
        list.innerHTML = "";
        
        let found = false;
        snap.forEach(child => {
            const m = child.val();
            const matchId = child.key;
            
            // --- TIME FORMATTING FIX FOR ISO STRING ---
            const matchDateObj = new Date(m.time);
            const matchDateString = matchDateObj.toISOString().split('T')[0]; 

            // 12-Hour format options
            const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
            const dateOptions = { day: 'numeric', month: 'short' };

            const formattedTime = matchDateObj.toLocaleTimeString('en-US', timeOptions);
            const formattedDate = matchDateObj.toLocaleDateString('en-US', dateOptions);
            const displayDateTime = `${formattedDate}, ${formattedTime}`;

            if (m.category === selectedCategory) {
                if (filterDate && matchDateString !== filterDate) return;
                found = true;
                
                const currentTime = new Date().getTime();
                const matchStartTime = matchDateObj.getTime();
                const matchEndTime = matchStartTime + (60 * 60000); 

                let statusColor = (currentTime < matchStartTime) ? "#28a745" : (currentTime <= matchEndTime ? "#ffc107" : "#dc3545");

                list.innerHTML += `
                    <div 
                        onmousedown="startPress('${matchId}', this)" 
                        onmouseup="endPress()" 
                        ontouchstart="startPress('${matchId}', this)" 
                        ontouchend="endPress()"
                        onclick="handleCardClick('${matchId}', this)"
                        style="background:#fff; padding:12px; border-radius:10px; margin-bottom:10px; border-left: 5px solid ${statusColor}; display:flex; justify-content:space-between; align-items:center; cursor:pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1); user-select:none;">
                        <div>
                            <strong style="font-size:14px;">${m.category} - ${m.teamType}</strong><br>
                            <small style="color:#666;">${displayDateTime}</small><br>
                            <small style="color:#ff4d4d; font-weight:bold;">Host: ${m.assignedHost || 'None'}</small>
                        </div>
                        <button onclick="event.stopPropagation(); deleteMatch('${matchId}')" style="background:none; border:none; color:red; cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>`;
            }
        });
        if (!found) list.innerHTML = `<div style="text-align:center; color:#888; padding:20px;">Matches onnumilla!</div>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('filterDate');
    if(dateInput) dateInput.value = today;
    loadActiveMatches();
});

async function deleteMatch(id) {
    if(confirm("Ee match delete cheyyano?")) await db.ref(`matches/${id}`).remove();
}

