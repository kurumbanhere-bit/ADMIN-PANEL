import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, query, orderByChild, equalTo, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// URL-il ninnu UID edukkunnu (Admin panel nalkunna UID)
const urlParams = new URLSearchParams(window.location.search);
const targetUid = urlParams.get('uid');

const container = document.getElementById("txContainer");

if (targetUid) {
    // Database-il 'transactions' node-il 'uid' field vechu filter cheyyunnu
    const txRef = query(ref(db, "transactions"), orderByChild("uid"), equalTo(targetUid));

    onValue(txRef, (snapshot) => {
        container.innerHTML = "";
        
        if (!snapshot.exists()) {
            container.innerHTML = `<div style="text-align:center; margin-top:50px; color:#7f8c8d;">No history found for this user.</div>`;
            return;
        }

        let list = [];
        snapshot.forEach(child => { list.push(child.val()); });
        list.reverse(); // Newest transactions first

        list.forEach(tx => {
            // Date processing
            const d = tx.timestamp ? new Date(tx.timestamp) : new Date();
            const dS = d.toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
            const tS = d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
            
            let st = (tx.status || 'pending').toLowerCase();
            
            container.innerHTML += `
                <div class="tx-card ${st}">
                    <div class="tx-details">
                        <span class="tx-type">${tx.type || 'Transaction'}</span>
                        <span class="tx-date">${dS} | ${tS}</span>
                        <div style="font-size:10px; color:#888;">${tx.reason || ''}</div>
                    </div>
                    <div class="tx-right" style="text-align:right;">
                        <div class="tx-amount">₹${tx.amount}</div>
                        <span class="status-badge badge-${st}">${st}</span>
                    </div>
                </div>`;
        });
    }, (error) => {
        container.innerHTML = `<div style="color:red; text-align:center;">Error: ${error.message}</div>`;
    });
} else {
    container.innerHTML = `<div style="text-align:center; margin-top:50px;">Invalid User ID.</div>`;
}
