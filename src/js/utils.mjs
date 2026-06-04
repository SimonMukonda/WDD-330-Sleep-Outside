// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// function to get the parameters from the URL when requested
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "beforeend",
  clear = true,
) {
  if (!parentElement || !templateFn || !Array.isArray(list)) return;
  if (clear) parentElement.innerHTML = "";
  list.forEach((item) => {
    const html = templateFn(item);
    parentElement.insertAdjacentHTML(position, html);
  });
}

// 1. Inserts a single template string into a DOM parent element (clearing it out)
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

// 2. Fetches an HTML file asynchronously and converts it into plain text
export async function loadTemplate(path) {
  const res = await fetch(path);
  if (res.ok) {
    const template = await res.text();
    return template;
  }
  throw new Error(`Template at path ${path} could not be loaded.`);
}

// Dynamic Login / Logout Header State Controller
export function checkLoginStatus() {
  const token = localStorage.getItem("user_token");
  const loginLink = document.getElementById("login-link");
  const userControls = document.getElementById("user-controls");
  const logoutBtn = document.getElementById("logout-btn");

  if (loginLink && userControls) {
    if (token) {
      // User is logged in: hide login trigger, activate profile panel
      loginLink.style.display = "none";
      userControls.style.display = "flex";

      // Sign-out action binding
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("user_token");
          window.location.href = "/index.html";
        });
      }
    } else {
      // User is logged out: enforce secure standard layout
      loginLink.style.display = "inline";
      userControls.style.display = "none";
    }
  }
}

export async function loadHeaderFooter() {
  try {
    const headerTemplate = await loadTemplate("../partials/header.html");
    const footerTemplate = await loadTemplate("../partials/footer.html");

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement) headerElement.innerHTML = headerTemplate;
    if (footerElement) footerElement.innerHTML = footerTemplate;

    // Run login evaluation now that partial templates are injected into the DOM
    checkLoginStatus();
  } catch (error) {
    console.error("Failed to inject header/footer templates:", error);
  }
}

export function alertMessage(message, scroll = true) {
  const existing = document.querySelector(".alert");
  if (existing) {
    existing.remove();
  }

  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.innerHTML = `<p>${message}</p><span>X</span>`;

  alert.addEventListener("click", function (e) {
    if (e.target.tagName === "SPAN") {
      document.querySelector("main").removeChild(this);
    }
  });

  document.querySelector("main").prepend(alert);
  if (scroll) window.scrollTo(0, 0);
}

export function showWelcomeBanner() {
  if (localStorage.getItem("so-visited")) return;

  const banner = document.createElement("div");
  banner.classList.add("welcome-banner");
  banner.innerHTML = `
    <div class="welcome-banner__content">
      <div class="welcome-banner__text">
        <strong>🎁 New Member Giveaway</strong>
        <p>Register for free and win a complete tent, sleeping bag, and camping gear worth <strong>$500!</strong> Ends April 30.</p>
      </div>
      <a href="/register/index.html" class="welcome-banner__cta">Enter Giveaway</a>
    </div>
    <span class="welcome-banner__close">X</span>
  `;

  banner.addEventListener("click", function (e) {
    if (e.target.classList.contains("welcome-banner__close")) {
      localStorage.setItem("so-visited", "true");
      this.remove();
    }
  });

  const main = document.querySelector("main");
  if (main) main.prepend(banner);
}