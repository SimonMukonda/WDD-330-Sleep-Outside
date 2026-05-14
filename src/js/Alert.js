export default class Alert {
  constructor(jsonPath) {
    this.jsonPath = jsonPath;
  }

  async loadAlerts() {
    try {
      const response = await fetch(this.jsonPath);
      const alerts = await response.json();

      if (alerts.length > 0) {
        const section = document.createElement("section");
        section.classList.add("alert-list");

        alerts.forEach(alert => {
          const p = document.createElement("p");
          p.textContent = alert.message;
          p.style.background = alert.background;
          p.style.color = alert.color;
          section.appendChild(p);
        });

        const main = document.querySelector("main");
        if (main) {
          main.prepend(section);
        }
      }
    } catch (err) {
      console.error("Error loading alerts:", err);
    }
  }
}