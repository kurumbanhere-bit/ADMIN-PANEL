/* ⚡ KL ESPORTS - CARD MANAGEMENT ENGINE (UPDATED WITH TICK) */

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
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

// URL-ൽ നിന്ന് Match ID എടുക്കുന്നു
const urlParams = new URLSearchParams(window.location.search);
const matchId = urlParams.get('id');

async function loadData() {
    if(!matchId) return;
    
    db.ref('matches/' + matchId).on('value', snap => {
        const m = snap.val();
        if(!m) return;

        const joinedCount = m.participants ? Object.keys(m.participants).length : 0;
        
        document.getElementById('matchTitle').innerText = m.category || "Tournament";
        document.getElementById('mPrize').innerText = m.prize || 0;
        document.getElementById('mJoined').innerText = joinedCount; 
        document.getElementById('mMax').innerText = m.max || 48;
        
        if(m.roomId) document.getElementById('roomIdInput').value = m.roomId;
        if(m.roomPass) document.getElementById('roomPassInput').value = m.roomPass;
        
        updateStatusUI(m.status || 'upcoming');

        const pList = document.getElementById('participantsList');
        pList.innerHTML = "";
        
        if(m.participants) {
            Object.values(m.participants).forEach(p => {
                const isSquad = p.teamType === "SQUAD";
                const isDuo = p.teamType === "DUO";
                
                // ADDED: Card-il click cheyyumpol 'selected' class toggle aakanulla onclick attribute
                let html = `
                    <div class="player-card" onclick="this.classList.toggle('selected')">
                        <div class="player-main">
                            <div>
                                <div class="player-name">
                                    <i class="fa-solid fa-user-check" style="color:var(--red); margin-right:5px;"></i> 
                                    ${p.playerName}
                                </div>
                                <div style="font-size:11px; color:#666; margin-left:22px; font-weight:700;">
                                    ID: ${p.gameID || 'N/A'} 
                                </div>
                            </div>
                            <div class="tick-circle">
                                <i class="fa-solid fa-check"></i>
                            </div>
                        </div>`;
                
                if((isSquad || isDuo) && p.teamInfo && p.teamInfo.members) {
                    html += `<div class="squad-info" style="margin-top:10px; padding-top:10px; border-top:1px dashed #eee; display:flex; flex-wrap:wrap; gap:6px;">`;
                    p.teamInfo.members.forEach((member, index) => {
                        if(index === 0) return; 
                        html += `<div class="member-name">${member}</div>`;
                    });
                    html += `</div>`;
                    html += `<div style="font-size:9px; color:#aaa; margin-top:5px; font-weight:bold;">TEAM ID: ${p.teamInfo.teamId}</div>`;
                }
                
                html += `</div>`;
                pList.innerHTML += html;
            });
        } else {
            pList.innerHTML = "<p style='text-align:center; font-size:12px; color:#999;'>No players joined yet.</p>";
        }
    });
}

function updateRoomDetails() {
    const rid = document.getElementById('roomIdInput').value;
    const rpass = document.getElementById('roomPassInput').value;
    if(!rid) return alert("Please enter a Room ID!");

    db.ref('matches/' + matchId).update({
        roomId: rid,
        roomPass: rpass
    }).then(() => {
        alert("Room details updated! 🔥");
    });
}

// Function to update status to 'upcoming' or 'started'
function updateStatus(status) {
    db.ref('matches/' + matchId).update({ 
        status: status.toLowerCase() 
    }).then(() => {
        alert("Status updated to " + status);
    });
}

// Your endMatch function is already good, but ensure it sets the status to 'ended'
async function endMatch() {
    if (!matchId) return alert("Match ID not found!");

    const confirmEnd = confirm("Move this match to Ended section?");
    if (!confirmEnd) return;

    const matchRef = db.ref('matches/' + matchId);
    const endedRef = db.ref('winnings-sender/ended/' + matchId);

    try {
        const snapshot = await matchRef.once('value');
        const matchData = snapshot.val();

        if (matchData) {
            await endedRef.set(matchData);
            // This is the important part:
            await matchRef.update({ status: 'ended' }); 
            alert("Match status updated to ENDED!");
        }
    } catch (error) {
        console.error("Error: ", error);
    }
}

function updateStatus(status) {
    db.ref('matches/' + matchId).update({ status: status.toLowerCase() });
}

loadData();