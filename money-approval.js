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

let currentView = 'add';

function switchTab(type) {
    currentView = type;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const targetTab = document.getElementById(type === 'add' ? 'addTab' : 'withdrawTab');
    if (targetTab) targetTab.classList.add('active');
    fetchData();
}

function fetchData() {
    const container = document.getElementById('listContainer');
    
    // Listening to transactions in real-time
    db.ref("transactions").on("value", (snapshot) => {
        container.innerHTML = "";
        const data = snapshot.val();
        
        if(!data) {
            container.innerHTML = '<div id="empty-msg">No pending requests!</div>';
            return;
        }

        let count = 0;
        Object.keys(data).forEach(id => {
            const req = data[id];
            
            // Fix: Status check case-insensitive aakkittundu
            if(!req.status || req.status.toLowerCase() !== "pending") return;

            if(currentView === 'add' && req.type === 'deposit') {
                const card = document.createElement('div');
                card.className = "card";
                card.innerHTML = `
                    <div class="details"><b>Email:</b> ${req.email || 'N/A'}</div>
                    <div class="details"><b>UID:</b> ${req.uid}</div>
                    <div class="details"><b>UTR:</b> <span class="utr-text">${req.utr || 'N/A'}</span></div>
                    <div class="amt">₹${req.amount}</div>
                    <div class="btn-group">
                        <button class="btn btn-approve" onclick="approveDeposit('${id}', '${req.uid}', ${req.amount})">APPROVE</button>
                        <button class="btn btn-reject" onclick="rejectDeposit('${id}')">REJECT</button>
                    </div>
                `;
                container.appendChild(card);
                count++;
            } else if (currentView === 'withdraw' && req.type === 'withdrawal') {
                const card = document.createElement('div');
                card.className = "card";
                card.style.borderLeft = "5px solid #f39c12"; 
                card.innerHTML = `
                    <div class="details"><b>Email:</b> ${req.email || 'N/A'}</div>
                    <div class="details"><b>UPI ID:</b> <span class="utr-text">${req.upiId || 'N/A'}</span></div>
                    <div class="amt">₹${req.amount}</div>
                    <div class="btn-group">
                        <button class="btn btn-approve" style="background:#1a73e8" onclick="approveWithdrawal('${id}')">MARK AS PAID</button>
                        <button class="btn btn-reject" onclick="rejectWithdrawal('${id}', '${req.uid}', ${req.amount})">REJECT & REFUND</button>
                    </div>
                `;
                container.appendChild(card);
                count++;
            }
        });
        
        if(count === 0) {
            container.innerHTML = '<div id="empty-msg">No pending ' + currentView + ' requests!</div>';
        }
    });
}

// WALLET & APPROVAL LOGIC
async function approveDeposit(txId, uid, amount) {
    if(!confirm("Approve ₹" + amount + " for this user?")) return;
    
    const userWalletRef = db.ref(`users/${uid}/wallet`);
    
    try {
        const snapshot = await userWalletRef.once("value");
        let wallet = snapshot.val();

        let currentDeposit = 0;
        let currentWinnings = 0;

        // Wallet data format handling
        if (wallet && typeof wallet === 'object') {
            currentDeposit = Number(wallet.deposit) || 0;
            currentWinnings = Number(wallet.winnings) || 0;
        } else if (wallet) {
            currentDeposit = Number(wallet) || 0;
        }

        // Update Wallet Balance
        await userWalletRef.update({
            deposit: currentDeposit + Number(amount),
            winnings: currentWinnings
        });

        // Mark transaction as success
        await db.ref(`transactions/${txId}`).update({ status: "success" });
        alert("Payment Approved! Cash added to user wallet.");
        
    } catch(e) { 
        alert("Error: " + e.message); 
    }
}

async function rejectDeposit(txId) {
    if(!confirm("Are you sure you want to reject this deposit?")) return;
    try {
        await db.ref(`transactions/${txId}`).update({ status: "failed" });
        alert("Deposit Rejected.");
    } catch(e) { alert("Error: " + e.message); }
}

async function approveWithdrawal(txId) {
    if(!confirm("Confirm that you have paid the amount?")) return;
    try {
        await db.ref(`transactions/${txId}`).update({ status: "success" });
        alert("Withdrawal marked as Success.");
    } catch(e) { alert("Error: " + e.message); }
}

async function rejectWithdrawal(txId, uid, amount) {
    if(!confirm("Reject and refund ₹" + amount + " to user?")) return;
    
    const userWalletRef = db.ref(`users/${uid}/wallet`);
    try {
        const snapshot = await userWalletRef.once("value");
        let wallet = snapshot.val();
        
        let currentDeposit = 0;
        let currentWinnings = 0;

        if (wallet && typeof wallet === 'object') {
            currentDeposit = Number(wallet.deposit) || 0;
            currentWinnings = Number(wallet.winnings) || 0;
        } else if (wallet) {
            currentDeposit = Number(wallet) || 0;
        }

        // Refund to winnings
        await userWalletRef.update({
            deposit: currentDeposit,
            winnings: currentWinnings + Number(amount)
        });

        await db.ref(`transactions/${txId}`).update({ status: "failed" });
        alert("Withdrawal rejected and amount refunded.");
    } catch(e) { alert("Error: " + e.message); }
}

// Initial Call
fetchData();
