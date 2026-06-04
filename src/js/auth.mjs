// src/js/Auth.mjs

const SERVICES_URL = "https://wdd330-backend.onrender.com/"; // Replace with your actual backend API URL if different

export default class Auth {
    constructor() {
        this.token = "";
    }

    /**
     * Logs a user in by sending credentials to the API
     * @param {Object} creds - Object containing email and password { email, password }
     * @param {Function} redirectCallback - Optional callback to run after a successful login
     */
    async login(creds, redirectCallback) {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(creds),
        };

        try {
            const response = await fetch(`${SERVICES_URL}login`, options);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed. Please check your credentials.");
            }

            const data = await response.json();
            // The API typically returns an object like { accessToken: "your_jwt_token_here" }
            this.token = data.accessToken;

            // Store the token in localStorage
            localStorage.setItem("user_token", this.token);

            // If a callback redirection function was passed, execute it
            if (redirectCallback && typeof redirectCallback === "function") {
                redirectCallback();
            }
        } catch (err) {
            console.error("Auth Error:", err);
            throw err;
        }
    }

    /**
     * Clear the token from local storage and memory to log out the user
     */
    logout() {
        localStorage.removeItem("user_token");
        this.token = "";
        window.location.href = "/index.html";
    }

    /**
     * Retrieves the token and extracts its payload to check expiration
     * @returns {boolean} True if token exists and is valid, False otherwise
     */
    checkLogin() {
        const token = localStorage.getItem("user_token");

        if (!token) {
            return false;
        }

        // JWT structure is header.payload.signature. We decode the payload (index 1).
        try {
            const payload = token.split(".")[1];
            // Decode base64 string safely
            const decodedPayload = JSON.parse(atob(payload));

            // JWT expiration 'exp' is in seconds, JavaScript Date.now() is in milliseconds
            if (decodedPayload.exp * 1000 < Date.now()) {
                // Token has expired
                this.logout();
                return false;
            }

            this.token = token;
            return true;
        } catch (e) {
            // If parsing fails, the token is corrupted or invalid
            console.error("Invalid token format detected");
            return false;
        }
    }

    /**
     * Middleware utility to lock down a page.
     * If user isn't logged in, redirects them to the login page and remembers where they wanted to go.
     */
    isTokenValid() {
        if (!this.checkLogin()) {
            // Remember current page so we can send them back after login
            const currentUrl = window.location.href;
            window.location.href = `/login/index.html?redirect=${encodeURIComponent(currentUrl)}`;
            return false;
        }
        return true;
    }

    /**
     * Helper to append the JWT token to headers for authorized backend requests
     * @param {Object} headers - Existing headers object
     * @returns {Object} Headers object containing the Authorization Bearer token
     */
    getAuthHeaders(headers = {}) {
        if (this.token || localStorage.getItem("user_token")) {
            headers["Authorization"] = `Bearer ${this.token || localStorage.getItem("user_token")}`;
        }
        return headers;
    }
}