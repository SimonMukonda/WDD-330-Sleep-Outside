import Auth from "../js/Auth.mjs";
// Imports the core template loader from your project utilities
import { loadHeaderFooter } from "../js/utils.mjs";

// Executes immediately to render navigation header and page footer
loadHeaderFooter();

const auth = new Auth();
const form = document.querySelector("#login-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Gathers input values from the form fields
    const credentials = {
        email: form.email.value,
        password: form.password.value
    };

    try {
        // 2. Checks if the user was sent here from a restricted page 
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect") || "/index.html";

        // 3. Runs login routine. It passes credentials, gets the token, and redirects
        await auth.login(credentials, () => {
            window.location.href = redirectUrl;
        });

    } catch (err) {
        // 4. Handles failed logins gracefully (bad password, server down, etc.)
        alert(`Authentication Failed: ${err.message}`);
    }
});