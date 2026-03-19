document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("username-input");
    const usernameSubmitBtn = document.getElementById("username-submit-btn");
    const passwordInput = document.getElementById("staff-password-input");
    const loginStatus = document.getElementById("login-status");

    const settingStatus = document.getElementById("settings-status");

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }


    usernameSubmitBtn.addEventListener("click", async function () {
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        if (!username) {
            loginStatus.textContent = "Please enter a username.";
            loginStatus.style.color = "red";
            return;
        }

        if (username === "staff") {
            if (passwordInput.classList.contains("hidden")) {
                passwordInput.classList.remove("hidden");
                passwordInput.focus();
                return;
            }

            try {
                const { data, error } = await window.supabaseClient
                    .from("staff")
                    .select("id, username, password_hash")
                    .eq("username", username)
                    .maybeSingle();

                if (error) {
                    throw error;
                }

                if (!data) {
                    loginStatus.textContent = "Staff user not found.";
                    loginStatus.style.color = "red";
                    return;
                }

                const enteredPasswordHash = await hashPassword(password);

                if (enteredPasswordHash === data.password_hash) {
                    localStorage.setItem("isStaff", "true");
                    localStorage.setItem("staffId", data.id);
                    localStorage.setItem("staffUsername", data.username);

                    loginStatus.textContent = "You have logged in as staff.";
                    loginStatus.style.color = "white";

                    usernameInput.disabled = true;
                    passwordInput.disabled = true;
                    usernameSubmitBtn.disabled = true;

                    id("staff-settings").style.display = "block";
                    id("scaling-factor-input").value = await getScalingFactor();
                    id("blatancy-factor-input").value = await getBlatancyFactor();
                } else {
                    loginStatus.textContent = "Incorrect password.";
                    loginStatus.style.color = "red";
                }
            } catch (err) {
                console.error("Staff login error:", err);
                loginStatus.textContent = "Database connection failed.";
                loginStatus.style.color = "red";
            }
        } else {
            try {
                const participant = await getOrCreateParticipant(username);
                const session = await createExperimentSession(participant.id);

                localStorage.setItem("isStaff", "false");
                localStorage.setItem("participantId", participant.id);
                localStorage.setItem("participantUsername", participant.username);
                localStorage.setItem("participantLoggedIn", "true");
                localStorage.setItem("experimentSessionId", session.id);

                loginStatus.textContent = "Participant login successful.";
                loginStatus.style.color = "white";

                usernameInput.disabled = true;
                passwordInput.disabled = true;
                usernameSubmitBtn.disabled = true;

                console.log("Participant:", participant);
                console.log("Experiment session:", session);
            } catch (err) {
                console.error("Participant login error:", err);
                loginStatus.textContent = "Participant login failed.";
                loginStatus.style.color = "red";
            }
        }
    });

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

    id("save-settings-btn").addEventListener("click", async function () {    
        const scalingFactor = parseFloat(document.getElementById("scaling-factor-input").value);
        const blatancyFactor = parseFloat(document.getElementById("blatancy-factor-input").value);

        if (isNaN(scalingFactor) || scalingFactor < 0 || scalingFactor > 1) {
            settingStatus.textContent = "Scaling factor must be between 0 and 1.";
            settingStatus.style.color = "red";
            return;
        }
        if (isNaN(blatancyFactor) || blatancyFactor < 0 || blatancyFactor > 1) {
            settingStatus.textContent = "Blatancy factor must be between 0 and 1.";
            settingStatus.style.color = "red";
            return;
        }
        try {            
            await setExperimentSettings(scalingFactor, blatancyFactor);
            settingStatus.textContent = "Experiment settings updated.";
            settingStatus.style.color = "white";
        } catch (err) {
            console.error("Error updating settings:", err);
            settingStatus.textContent = "Failed to update settings.";
            settingStatus.style.color = "red";
        }

    });
});