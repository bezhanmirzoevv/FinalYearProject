document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("username-input");
    const usernameSubmitBtn = document.getElementById("username-submit-btn");
    const passwordInput = document.getElementById("staff-password-input");
    const loginStatus = document.getElementById("login-status");
    const settingStatus = document.getElementById("settings-status");
    const scalingFactorInput = document.getElementById("scaling-factor-input");
    const blatancyFactorInput = document.getElementById("blatancy-factor-input");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const staffSettings = document.getElementById("staff-settings");

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    function showMessage(element, message, color) {
        element.textContent = message;
        element.style.color = color;
        element.style.display = "block";
    }

    function disableLoginForm() {
        usernameInput.disabled = true;
        passwordInput.disabled = true;
        usernameSubmitBtn.disabled = true;
    }

    function isValidFactor(value) {
        return !isNaN(value) && value >= 0 && value <= 1;
    }

    async function handleStaffLogin(username, password) {
        if (passwordInput.classList.contains("hidden")) {
            passwordInput.classList.remove("hidden");
            passwordInput.focus();
            return;
        }

        const { data, error } = await window.supabaseClient
            .from("staff")
            .select("id, username, password_hash")
            .eq("username", username)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            showMessage(loginStatus, "Staff user not found.", "red");
            return;
        }

        const enteredPasswordHash = await hashPassword(password);

        if (enteredPasswordHash !== data.password_hash) {
            showMessage(loginStatus, "Incorrect password.", "red");
            return;
        }

        localStorage.setItem("isStaff", "true");
        localStorage.setItem("staffId", data.id);
        localStorage.setItem("staffUsername", data.username);

        showMessage(loginStatus, "You have logged in as staff.", "white");
        disableLoginForm();

        staffSettings.style.display = "block";
        scalingFactorInput.value = await getScalingFactor();
        blatancyFactorInput.value = await getBlatancyFactor();
    }

    async function handleParticipantLogin(username) {
        const participant = await getOrCreateParticipant(username);
        const session = await createExperimentSession(participant.id);

        localStorage.setItem("isStaff", "false");
        localStorage.setItem("participantId", participant.id);
        localStorage.setItem("participantUsername", participant.username);
        localStorage.setItem("participantLoggedIn", "true");
        localStorage.setItem("experimentSessionId", session.id);

        showMessage(loginStatus, "Participant login successful.", "white");
        disableLoginForm();

        console.log("Participant:", participant);
        console.log("Experiment session:", session);
    }

    async function handleLogin() {
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        if (!username) {
            showMessage(loginStatus, "Please enter a username.", "red");
            return;
        }

        try {
            if (username === "staff") {
                await handleStaffLogin(username, password);
            } else {
                await handleParticipantLogin(username);
            }
        } catch (err) {
            console.error("Login error:", err);

            if (username === "staff") {
                showMessage(loginStatus, "Database connection failed.", "red");
            } else {
                showMessage(loginStatus, "Participant login failed.", "red");
            }
        }
    }

    async function handleSaveSettings() {
        const scalingFactor = parseFloat(scalingFactorInput.value);
        const blatancyFactor = parseFloat(blatancyFactorInput.value);

        if (!isValidFactor(scalingFactor)) {
            showMessage(settingStatus, "Scaling factor must be between 0 and 1.", "red");
            return;
        }

        if (!isValidFactor(blatancyFactor)) {
            showMessage(settingStatus, "Blatancy factor must be between 0 and 1.", "red");
            return;
        }

        try {
            await setExperimentSettings(scalingFactor, blatancyFactor);
            showMessage(settingStatus, "Experiment settings updated.", "white");
        } catch (err) {
            console.error("Error updating settings:", err);
            showMessage(settingStatus, "Failed to update settings.", "red");
        }
    }

    function handleEnterKey(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleLogin();
        }
    }

    usernameSubmitBtn.addEventListener("click", handleLogin);
    saveSettingsBtn.addEventListener("click", handleSaveSettings);
    usernameInput.addEventListener("keydown", handleEnterKey);
    passwordInput.addEventListener("keydown", handleEnterKey);
});