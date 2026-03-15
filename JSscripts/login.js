document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("username-input");
    const usernameSubmitBtn = document.getElementById("username-submit-btn");
    const passwordInput = document.getElementById("staff-password-input");
    const loginStatus = document.getElementById("login-status");

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    async function getOrCreateParticipant(username) {
        const { data: existingParticipant, error: selectError } = await window.supabaseClient
            .from("participants")
            .select("id, username")
            .eq("username", username)
            .maybeSingle();

        if (selectError) {
            throw selectError;
        }

        if (existingParticipant) {
            return existingParticipant;
        }

        const { data: newParticipant, error: insertError } = await window.supabaseClient
            .from("participants")
            .insert([{ username: username }])
            .select("id, username")
            .single();

        if (insertError) {
            throw insertError;
        }

        return newParticipant;
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

                localStorage.setItem("isStaff", "false");
                localStorage.setItem("participantId", participant.id);
                localStorage.setItem("participantUsername", participant.username);

                loginStatus.textContent = "Participant login successful.";
                loginStatus.style.color = "white";

                usernameInput.disabled = true;
                passwordInput.disabled = true;
                usernameSubmitBtn.disabled = true;
                
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
});