// Page load aayi kazhinjal mathram visibility on aakkuka
document.addEventListener("DOMContentLoaded", function() {
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
});

function checkLogin() {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("pass").value;
    const msg = document.getElementById("msg");

    const adminEmail = "kurumbanhere@gmail.com";
    const adminPass = "kurumbanhere123";

    if (email === adminEmail && pass === adminPass) {
        msg.style.color = "green";
        msg.innerHTML = "Access Granted! Redirecting...";
        
        // Session save cheyyunnu
        const sessionData = { email: email, time: new Date().getTime() };
        localStorage.setItem("adminSession", JSON.stringify(sessionData));

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);
    } else {
        msg.style.color = "red";
        msg.innerHTML = "Invalid Credentials!";
    }
}
