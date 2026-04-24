// --- FIREBASE CONFIGURATION ---
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

/**
 * 1. ADMIN MANUAL ENTRY
 * Admin-u direct aayi username-um password-um set cheyyaan
 */
function addHostManually() {
    const userField = document.getElementById('manualUser');
    const passField = document.getElementById('manualPass');
    
    const username = userField.value.trim();
    const password = passField.value.trim();

    if (username !== "" && password !== "") {
        // Push to 'approved_hosts' node
        db.ref('approved_hosts').push({
            username: username,
            password: password,
            type: "manual_entry",
            timestamp: Date.now()
        }).then(() => {
            alert("Host details added successfully!");
            userField.value = "";
            passField.value = "";
        }).catch((error) => {
            alert("Error: " + error.message);
        });
    } else {
        alert("Please enter both username and password!");
    }
}

/**
 * 2. LOAD DATA FROM FIREBASE
 * Pending requests-um Approved list-um live aayi load cheyyunnu
 */
function loadAllData() {
    // Listen for Pending Requests from Users
    db.ref('host_requests').on('value', (snap) => {
        const list = document.getElementById('requestList');
        const noBox = document.getElementById('noRequestBox');
        list.innerHTML = "";
        let hasPending = false;

        snap.forEach(child => {
            const data = child.val();
            if (data.status === "pending") {
                hasPending = true;
                list.innerHTML += `
                    <div class="card">
                        <div class="info">
                            <h3>${data.email}</h3>
                            <p>Pass: ${data.password}</p>
                        </div>
                        <div class="actions">
                            <i class="fa-solid fa-check" onclick="approveRequest('${child.key}','${data.email}','${data.password}')"></i>
                            <i class="fa-solid fa-trash" onclick="deleteRequest('${child.key}')"></i>
                        </div>
                    </div>`;
            }
        });
        noBox.style.display = hasPending ? "none" : "block";
    });

    // Listen for Approved Hosts (The ones who can login)
    db.ref('approved_hosts').on('value', (snap) => {
        const appList = document.getElementById('approvedList');
        appList.innerHTML = "";
        
        snap.forEach(child => {
            const data = child.val();
            appList.innerHTML += `
                <div class="card" style="border-left-color: #3498db;">
                    <div class="info">
                        <h3>${data.username}</h3>
                        <p>Pass: ${data.password}</p>
                    </div>
                    <div class="actions">
                        <i class="fa-solid fa-trash" style="color:#e74c3c" onclick="removeHostAccess('${child.key}')"></i>
                    </div>
                </div>`;
        });
    });
}

/**
 * 3. ACTION FUNCTIONS
 */

// User request approve cheyyunnu
function approveRequest(id, user, pass) {
    if(confirm("Approve this host?")) {
        // Status update cheyyunnu
        db.ref('host_requests/' + id).update({ status: 'approved' });
        // Approved list-ilekku details idunnu
        db.ref('approved_hosts').push({ 
            username: user, 
            password: pass,
            type: "approved_request"
        });
    }
}

// Request delete cheyyunnu
function deleteRequest(id) {
    if(confirm("Reject this request?")) {
        db.ref('host_requests/' + id).remove();
    }
}

// Approved list-il ninnu host-ne remove cheyyunnu (Login block aakum)
function removeHostAccess(id) {
    if(confirm("Are you sure you want to block this host?")) {
        db.ref('approved_hosts/' + id).remove();
    }
}

// Toggle function to show/hide list
function toggleApproved() {
    const sec = document.getElementById('approvedSection');
    if (sec.style.display === "block") {
        sec.style.display = "none";
    } else {
        sec.style.display = "block";
    }
}

// Initial Load call
loadAllData();
