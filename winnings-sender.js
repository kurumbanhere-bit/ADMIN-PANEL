// ⚡ KL ESPORTS - WINNINGS RECEIVER ENGINE
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

let currentCat = "BR PER KILL";
let currentStatus = "ended";

function filterCat(cat, btn) {
    currentCat = cat.toUpperCase();
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadData();
}

function showStatus(status, btn) {
    currentStatus = status;
    document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadData();
}

function loadData() {
    // 🔥 PATH: Admin panel ayachuna 'winnings-sender/ended' path-il ninnu edukkunnu
    db.ref('winnings-sender/ended').on('value', snap => {
        const matches = snap.val() || {};
        const listDiv = document.getElementById('matchList');
        listDiv.innerHTML = "";
        let count = 0;

        Object.keys(matches).reverse().forEach(id => {
            const m = matches[id];
            const mCat = (m.category || "").toUpperCase();
            
            // Winners data check
            const winnersNode = m.winners;
            const hasWinnersData = winnersNode && Object.keys(winnersNode).length > 0;

            // Filter logic
            if (mCat === currentCat) {
                let shouldShow = false;

                if (currentStatus === 'ended' && !hasWinnersData) {
                    shouldShow = true;
                } 
                else if (currentStatus === 'win' && hasWinnersData) {
                    shouldShow = true;
                }

                if (shouldShow) {
                    listDiv.innerHTML += `
                        <div class="match-card ${hasWinnersData ? 'win-border' : ''}" onclick="location.href='winnings-sender-card.html?id=${id}'">
                            ${!hasWinnersData ? '<div class="pending-badge">ACTION NEEDED</div>' : ''}
                            <div class="card-header">
                                <div><span class="match-title">${m.category}</span></div>
                                <div class="time-tag"><i class="far fa-calendar-alt"></i> ${m.date || ''} | ${m.time || ''}</div>
                            </div>
                            <div class="detail-grid">
                                <div><small style="color:#888; font-size:10px; text-transform:uppercase;">Entry Fee</small><div class="detail-value">₹${m.entry || 0}</div></div>
                                <div><small style="color:#888; font-size:10px; text-transform:uppercase;">Prize Pool</small><div class="detail-value" style="color:#e63946;">₹${m.prize || 0}</div></div>
                            </div>
                        </div>`;
                    count++;
                }
            }
        });

        if(count === 0) {
            listDiv.innerHTML = `
                <div style='text-align:center; color:#bbb; margin-top:60px;'>
                    <i class="fas fa-folder-open" style="font-size:40px; margin-bottom:10px;"></i>
                    <p style='font-size:13px; font-weight:bold;'>NO ${currentStatus.toUpperCase()} MATCHES FOUND</p>
                </div>`;
        }
    });
}

// Initial load
loadData();
