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

if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const db = firebase.database();

// Get Match ID from URL
const urlParams = new URLSearchParams(window.location.search);
const matchId = urlParams.get('id');

let participantArray = [];

// 2. Load Match Data & Participants
async function loadData() {
    const pList = document.getElementById('participantsList');
    if(!matchId) {
        pList.innerHTML = "Error: No Match ID";
        return;
    }
    
    // PATH CHECK: Matches-inte main folder 'matches' aayirikkum
    const matchRef = db.ref('matches/' + matchId);

    matchRef.on('value', snap => {
        const m = snap.val();
        if(!m) {
            pList.innerHTML = "Match not found!";
            return;
        }

        // Header Updates
        document.getElementById('matchTitle').innerText = m.category || "Match Details";
        document.getElementById('mPrize').innerText = m.prizePool || "0";
        document.getElementById('mJoined').innerText = m.joined || "0";
        document.getElementById('mMax').innerText = m.totalSlots || "0";
        
        pList.innerHTML = "";
        participantArray = [];

        // Loading Participants
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
                    <div class="player-row" style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; align-items: center;">
                        <div style="flex: 2;"><b>${p.playerName || "Unknown"}</b></div>
                        <input type="text" id="rank-${pKey}" placeholder="Rank" value="${rank}" style="width: 40px; text-align: center;">
                        <input type="number" id="kills-${pKey}" placeholder="Kills" value="${kills}" style="width: 40px; text-align: center;">
                        <input type="number" id="prize-${pKey}" placeholder="Prize" value="${prize}" style="width: 60px; text-align: center;">
                    </div>`;
            });
        } else {
            pList.innerHTML = "No participants found.";
        }
        displayWinnerList(m.winners);
    });
}

// 3. Save Results & Update Status
async function saveResults() {
    if(!matchId || participantArray.length === 0) {
        alert("No data to save!");
        return;
    }

    // Reference changed to match current logic
    const snapshot = await db.ref(`matches/${matchId}/winners`).once('value');
    const oldWinnersData = snapshot.val() || {};
    let winnersData = {};
    
    for (const item of participantArray) {
        const pKey = item.key; 
        const rankValue = document.getElementById(`rank-${pKey}`).value.trim();
        const killsValue = parseInt(document.getElementById(`kills-${pKey}`).value) || 0;
        const prizeValue = parseInt(document.getElementById(`prize-${pKey}`).value) || 0;
        const oldPrizeValue = oldWinnersData[pKey]?.prize || 0;

        winnersData[pKey] = {
            playerName: item.data.playerName || "Unknown",
            rank: rankValue,
            kills: killsValue,
            prize: prizeValue
        };

        // Wallet Update (Only if prize changed)
        if (prizeValue !== oldPrizeValue) {
            const walletRef = db.ref(`users/${pKey}/wallet/winnings`);
            await walletRef.transaction((current) => (current || 0) - oldPrizeValue + prizeValue);
        }
    }

    try {
        // IMPORTANT: Update status to 'completed'
        const updateObj = {
            winners: winnersData,
            status: 'completed',
            resultPublished: true,
            isEnded: true
        };

        await db.ref(`matches/${matchId}`).update(updateObj);
        
        // Also update the 'ended' archive if you use it separately
        await db.ref(`winnings-sender/ended/${matchId}`).update(updateObj);

        alert("✅ Winners Added & Status Updated!");
        window.history.back(); // Redirects to previous management page
    } catch (err) {
        alert("Error: " + err.message);
    }
}

function displayWinnerList(winners) {
    const displayDiv = document.getElementById('winnerListDisplay'); 
    if(!displayDiv || !winners) return;
    // ... winner list table logic can stay here ...
}

loadData();
