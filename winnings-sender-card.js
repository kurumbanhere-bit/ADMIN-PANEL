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

// Initialize Firebase
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const db = firebase.database();

// Get Match ID from URL
const urlParams = new URLSearchParams(window.location.search);
const matchId = urlParams.get('id');

let participantArray = [];
let matchTitle = "Match"; 

// 1. Data Load cheyyan
async function loadData() {
    const pList = document.getElementById('participantsList');
    if(!matchId) return;
    
    const matchRef = db.ref('winnings-sender/ended/' + matchId);

    matchRef.on('value', snap => {
        const m = snap.val();
        if(!m) return;

        matchTitle = m.title || "Match Result";
        pList.innerHTML = "";
        participantArray = [];

        if(m.participants) {
            const keys = Object.keys(m.participants);
            const winners = m.winners || {};

            keys.forEach(pKey => {
                const p = m.participants[pKey];
                participantArray.push({ key: pKey, data: p });

                const savedData = winners[pKey] || {};
                const rank = savedData.rank || "";
                const kills = (savedData.kills !== undefined) ? savedData.kills : 0;
                const prize = (savedData.prize !== undefined) ? savedData.prize : 0;

                pList.innerHTML += `
                    <div class="player-row" style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd;">
                        <div class="p-name"><b>${p.playerName || "Unknown"}</b></div>
                        <input type="text" id="rank-${pKey}" placeholder="Rank" value="${rank}" style="width: 50px;">
                        <input type="number" id="kills-${pKey}" placeholder="Kills" value="${kills}" style="width: 50px;">
                        <input type="number" id="prize-${pKey}" placeholder="Prize" value="${prize}" style="width: 70px;">
                    </div>`;
            });
        }
        displayWinnerList(m.winners);
    });
}

// 2. Data Save, Wallet Update & Status Change
async function saveResults() {
    if(!matchId || participantArray.length === 0) {
        alert("No participants found!");
        return;
    }

    let winnersData = {};
    
    for (const item of participantArray) {
        const pKey = item.key; 
        const rankValue = document.getElementById(`rank-${pKey}`).value.trim();
        const killsValue = parseInt(document.getElementById(`kills-${pKey}`).value) || 0;
        const prizeValue = parseInt(document.getElementById(`prize-${pKey}`).value) || 0;

        winnersData[pKey] = {
            playerName: item.data.playerName || "Unknown Player",
            rank: rankValue,
            kills: killsValue,
            prize: prizeValue
        };

        // --- WALLET UPDATE ---
        if (prizeValue > 0) {
            const walletRef = db.ref(`users/${pKey}/wallet/winnings`);
            
            await walletRef.transaction((currentBalance) => {
                return (currentBalance || 0) + prizeValue;
            });

            const txId = db.ref('transactions').push().key;
            db.ref(`transactions/${txId}`).set({
                uid: pKey,
                amount: prizeValue,
                type: "Match Win",
                status: "SUCCESS",
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                matchName: matchTitle
            });
        }
    }

    try {
        // Step A: Update winners data in 'ended' node
        await db.ref(`winnings-sender/ended/${matchId}`).update({
            winners: winnersData,
            resultPublished: true 
        });

        // Step B: IMPORTANT - Update original matches node status to 'completed'
        // Ithu cheythal User Panel-il card automatic aayi Completed section-ilekk maarum.
        await db.ref(`matches/${matchId}`).update({
            status: 'completed',
            isEnded: true
        });

        alert("✅ Result & Wallets Updated! Match moved to Completed Section.");
        window.location.href = "dashboard.html"; 
    } catch (err) {
        console.error("Error:", err);
        alert("Error: " + err.message);
    }
}

// 3. Winner List Display
function displayWinnerList(winners) {
    const displayDiv = document.getElementById('winnerListDisplay'); 
    if(!displayDiv || !winners) return;

    const sortedWinners = Object.values(winners).sort((a, b) => {
        return (parseInt(a.rank) || 999) - (parseInt(b.rank) || 999);
    });

    let html = `<h3>🏆 Match Result</h3>
                <table border="1" style="width:100%; text-align:center; border-collapse: collapse;">
                <tr style="background:#eee;"><th>Rank</th><th>Player</th><th>Kills</th><th>Prize</th></tr>`;

    sortedWinners.forEach(w => {
        if(w.rank || w.kills > 0 || w.prize > 0) {
            html += `<tr>
                        <td>#${w.rank || '-'}</td>
                        <td>${w.playerName}</td>
                        <td>${w.kills}</td>
                        <td>₹${w.prize}</td>
                     </tr>`;
        }
    });

    html += `</table>`;
    displayDiv.innerHTML = html;
}

loadData();
