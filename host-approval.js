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

function loadRequests() {
    db.ref('host_requests').on('value', (snap) => {
        const list = document.getElementById('requestList');
        const approvedList = document.getElementById('approvedList');
        const noBox = document.getElementById('noRequestBox');
        
        list.innerHTML = "";
        approvedList.innerHTML = ""; // Approved list clear cheyyunnu
        
        let pendingFound = false;

        if (snap.exists()) {
            snap.forEach((child) => {
                const data = child.val();
                
                // 1. Pending Requests Logic
                if (data.status === "pending") {
                    pendingFound = true;
                    list.innerHTML += `
                        <div class="request-card">
                            <div class="info">
                                <h3>${data.email}</h3>
                                <p>PASS: ${data.password}</p>
                            </div>
                            <div class="actions">
                                <i class="fa-solid fa-check" onclick="respond('${child.key}', 'approved')"></i>
                                <i class="fa-solid fa-xmark" onclick="respond('${child.key}', 'rejected')"></i>
                            </div>
                        </div>
                    `;
                } 
                // 2. Approved Hosts Logic
                else if (data.status === "approved") {
                    approvedList.innerHTML += `
                        <div class="approved-card">
                            <div class="info">
                                <h3>${data.email}</h3>
                                <p>PASS: ${data.password}</p>
                            </div>
                            <button class="btn-reject-small" onclick="respond('${child.key}', 'rejected')">Remove</button>
                        </div>
                    `;
                }
            });
        }
        noBox.style.display = pendingFound ? 'none' : 'block';
    });
}

function respond(id, status) {
    const msg = status === 'approved' ? 'Accept this host?' : 'Remove/Reject this host?';
    if(confirm(msg)) {
        db.ref('host_requests/' + id).update({ status: status })
        .then(() => console.log("Status Updated: " + status))
        .catch(err => alert("Error: " + err.message));
    }
}

// Toggle Button for Approved Hosts
document.getElementById('toggleApprovedBtn').addEventListener('click', function() {
    const container = document.getElementById('approvedContainer');
    if (container.style.display === "none") {
        container.style.display = "block";
        this.innerHTML = '<i class="fa-solid fa-eye-slash"></i> HIDE APPROVED HOSTS';
    } else {
        container.style.display = "none";
        this.innerHTML = '<i class="fa-solid fa-users-check"></i> VIEW APPROVED HOSTS';
    }
});

// Initial Load
loadRequests();
