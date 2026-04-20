// 1. Firebase Configuration (Ninte config thanne)
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

// --- CATEGORY CHANGE LOGIC ---
function changeCat(cat, el) {
    document.getElementById('mCategory').value = cat;
    document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    autoSetSlots(); 
    
    // Category maarumpol list filter cheyyan ithu call cheyyuka
    loadActiveMatches(); 
}
// --- AUTO SET SLOTS BASED ON TEAM TYPE ---
function autoSetSlots() {
    const type = document.getElementById('mTeamType').value;
    const maxInput = document.getElementById('mMax');
    if (type === "SOLO") maxInput.value = 48;
    else if (type === "DUO") maxInput.value = 48;
    else maxInput.value = 48; 
}

// --- IMAGE PREVIEW ---
function previewThumbnail() {
    const url = document.getElementById('mImageFile').value;
    const preview = document.getElementById('imagePreview');
    const text = document.getElementById('uploadText');
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        text.style.display = 'none';
    } else {
        preview.style.display = 'none';
        text.style.display = 'block';
    }
}

// --- ADD PRIZE ROWS ---
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

// --- MAIN PUBLISH FUNCTION (UPDATED) ---
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
// --- Admin Panel - Publish Match (Rules Part) ---
const rules = document.getElementById('mRules').value;
const rulesArray = rules ? rules.split(',').map(r => r.trim()).filter(r => r !== "") : [];

const matchData = {
    // ... bakki ellam athe pole ...
    rules: rulesArray, // Array aayi save cheyyunnu
    // ...
};
    
    // 🔥 Prize Data Collection Logic
    const prizeData = [];
    document.querySelectorAll('.prize-row').forEach(row => {
        const rank = row.querySelector('.rank-label').value;
        const val = row.querySelector('.rank-value').value;
        if(rank && val) {
            prizeData.push({ rank: rank, prize: val });
        }
    });

    const count = parseInt(document.getElementById('mCount').value) || 1;
    const gap = parseInt(document.getElementById('mGap').value) || 15;

    if (!startTime) return alert("Dayaayi time select cheyyuka!");

    btn.disabled = true;
    btn.innerText = "Publishing...";

    try {
        let baseTime = new Date(startTime);

        for (let i = 0; i < count; i++) {
            let matchTime = new Date(baseTime.getTime() + (i * gap * 60000)); // gap in minutes
            
            // publishMatch function-il ee maattom varuthuka
const matchData = {
    category,
    teamType,
    image,
    map,
    time: matchTime.toISOString(),
    entry: parseInt(entry),
    totalPrize: parseInt(prize),
    maxSlots: parseInt(max), // Ithu ninte code-il ippo und
    slotNumber: parseInt(max), // Puthiyathayi ithu koodi add cheyyaam (optional)
    rules: rules.split(',').map(r => r.trim()),
    prizes: prizeData,
    status: "UPCOMING",
    joined: 0,
    assignedHost: "kurumbanhere_gmail_com"
};

            await db.ref('matches').push(matchData);
        }

        alert(`${count} Match(es) successfully published!`);
        location.reload(); 

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "PUBLISH MATCH(ES)";
    }
}
function loadActiveMatches() {
    const selectedCategory = document.getElementById('mCategory').value;

    db.ref('matches').on('value', snap => {
        const list = document.getElementById('adminMatchList');
        if(!list) return;
        list.innerHTML = "";
        
        let found = false;

        snap.forEach(child => {
            const m = child.val();
            const matchId = child.key;

            if (m.category === selectedCategory) {
                found = true;

                // --- Status Logic Start ---
                const currentTime = new Date().getTime();
                const matchStartTime = new Date(m.time).getTime();
                const matchEndTime = matchStartTime + (60 * 60000); // 1 hour duration aayi kanakkakkunnu

                let statusText = "";
                let statusColor = "";

                if (currentTime < matchStartTime) {
                    statusText = "UPCOMING";
                    statusColor = "#28a745"; // Green
                } else if (currentTime >= matchStartTime && currentTime <= matchEndTime) {
                    statusText = "ONGOING";
                    statusColor = "#ffc107"; // Yellow/Orange
                } else {
                    statusText = "ENDED";
                    statusColor = "#dc3545"; // Red
                }
                // --- Status Logic End ---

                list.innerHTML += `
                    <div onclick="window.location.href='card.html?id=${matchId}'" 
                         style="background:#fff; padding:10px; border-radius:8px; margin-bottom:10px; border-left: 5px solid ${statusColor}; display:flex; justify-content:space-between; align-items:center; cursor:pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <div>
                            <strong style="font-size:14px;">${m.category} - ${m.teamType}</strong>
                            <span style="font-size: 10px; background: ${statusColor}; color: #fff; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${statusText}</span>
                            <br>
                            <small style="color:#666;">${new Date(m.time).toLocaleString()}</small>
                        </div>
                        <button onclick="event.stopPropagation(); deleteMatch('${matchId}')" 
                                style="background:none; border:none; color:red; cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
            }
        });

        if (!found) {
            list.innerHTML = `<div style="text-align:center; color:#888; padding:20px;">No active matches in ${selectedCategory}</div>`;
        }
    });
}


async function deleteMatch(id) {
    if(confirm("Ee match delete cheyyano?")) {
        await db.ref(`matches/${id}`).remove();
    }
}

document.addEventListener('DOMContentLoaded', loadActiveMatches);
