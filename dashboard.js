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

// ⚡ UI Reveal: Session local-aayi undel thuranthu kodukkuka
document.addEventListener("DOMContentLoaded", function() {
    const session = localStorage.getItem("adminSession");
    if (session) {
        document.body.style.visibility = "visible";
        document.body.style.opacity = "1";
    }
});

// ⚡ Auth Observer: Ithu kurae koode safe aakkunnundu
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // Correct User aanel session update cheyyുക
        if (user.email === "kurumbanhere@gmail.com") {
            localStorage.setItem("adminSession", JSON.stringify({email: user.email}));
        } else {
            // Vere aarelum aanel logout
            handleLogout();
        }
    } else {
        // Firebase-il session illenkil...
        // Pakshe nammal manual aayi login cheythittundel (localStorage), appol logout aakaruth
        const session = localStorage.getItem("adminSession");
        if (!session) {
            window.location.replace("index.html");
        }
    }
});

function goTo(page) {
    window.location.href = page;
}

function handleLogout() {
    firebase.auth().signOut().then(() => {
        localStorage.removeItem("adminSession");
        window.location.replace("index.html");
    });
}

function logout() {
    if(confirm("Logout cheyyano Boss?")) {
        handleLogout();
    }
}
