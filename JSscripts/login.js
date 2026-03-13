document.addEventListener("DOMContentLoaded", function () {

    const usernameInput = document.getElementById("username-input");
    const usernameSubmitBtn = document.getElementById("username-submit-btn");
    const passwordInput = document.getElementById("staff-password-input");
    const loginStatus = document.getElementById("login-status");

    const STAFF_PASSWORD = "admin123";

    usernameSubmitBtn.addEventListener("click", function () {

        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        if (username === "staff") {

            if (passwordInput.classList.contains("hidden")) {
                passwordInput.classList.remove("hidden");
                passwordInput.focus();
                return;
            }

            if (password === STAFF_PASSWORD) {
                localStorage.setItem("isStaff", "true");

                loginStatus.textContent = "You have logged in as staff.";
                loginStatus.style.color = "white";
                usernameInput.disabled = true;
                passwordInput.disabled = true;
                usernameSubmitBtn.disabled = true;
            } else {
                loginStatus.textContent = "Incorrect password.";
                loginStatus.style.color = "red";
            }

        } else {
            localStorage.setItem("participantUsername", username);
            console.log("Participant:", username);

            loginStatus.textContent = "You have logged in.";
            loginStatus.style.color = "white";

            usernameInput.disabled = true;
            passwordInput.disabled = true;
            usernameSubmitBtn.disabled = true;
        }

    });

    // ENTER key support
    usernameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            usernameSubmitBtn.click();
        }
    });

    passwordInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            usernameSubmitBtn.click();
        }
    });

});