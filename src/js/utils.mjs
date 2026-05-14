// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

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

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.insertAdjacentHTML("afterbegin", template);

  if (callback) {
    callback(data);
  }
}

async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");

  const headerElement = document.getElementById("main-header");
  const footerElement = document.getElementById("main-footer");

  renderWithTemplate(headerTemplate, headerElement);
  renderWithTemplate(footerTemplate, footerElement);
}

export function alertMessage(message, scroll = true) {
  // Remove any existing alert first to avoid stacking
  const existing = document.querySelector(".alert");
  if (existing) {
    existing.remove();
  }

  // Create the alert banner
  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.innerHTML = `<p>${message}</p><span>X</span>`;

  // Click listener - only dismiss if the X was clicked
  alert.addEventListener("click", function (e) {
    if (e.target.tagName === "SPAN") {
      document.querySelector("main").removeChild(this);
    }
  });

  // Prepend to <main> so it appears at the top of the page content
  document.querySelector("main").prepend(alert);

  if (scroll) window.scrollTo(0, 0);
}

export function showWelcomeBanner() {
  // Check if the visitor has been here before
  if (localStorage.getItem("so-visited")) return; // Exit if they have

  // Build the banner
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

  // Dismiss on click of the X and mark visitor as seen so it won't show again
  banner.addEventListener("click", function (e) {
    if (e.target.classList.contains("welcome-banner__close")) {
      localStorage.setItem("so-visited", "true");
      this.remove();
    }
  });

  // Prepend to <main> so it appears at the top of the page content
  const main = document.querySelector("main");
  if (main) main.prepend(banner);
}
