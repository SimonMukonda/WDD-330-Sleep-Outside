import ProductData from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

async function init() {
  // Wait for the templates to render before running DOM selections
  await loadHeaderFooter();

  const category = getParam("category") ?? "tents";
  const categoryLabel = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const titleSpan = document.querySelector(".title");
  if (titleSpan) titleSpan.textContent = categoryLabel;

  const dataSource = new ProductData();
  const element = document.querySelector(".product-list");
  const listing = new ProductList(category, dataSource, element);
  listing.init();
}

init();

// Global window-level sorting event listener
document.addEventListener("change", (event) => {
  if (event.target && event.target.id === "sort-select") {
    const criteria = event.target.value;
    // Look up the active selector container instance to process sorting
    const listElement = document.querySelector(".product-list");
    if (listElement && criteria) {
      // Re-initialize or handle list mapping safely
    }
  }
});