import ProductData from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

async function init() {
  await loadHeaderFooter();

  const category = getParam("category") ?? "tents";
  const categoryLabel = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const titleSpan = document.querySelector(".title");
  if (titleSpan) titleSpan.textContent = categoryLabel;

  const dataSource = new ProductData();
  const element = document.querySelector(".product-list");

  // 1. Create the instance
  const listing = new ProductList(category, dataSource, element);
  await listing.init();

  // 2. Attach the dropdown listener directly inside the active init context
  const sortSelect = document.querySelector("#sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (event) => {
      const criteria = event.target.value;
      if (criteria) {
        listing.sortList(criteria);
      }
    });
  }
}

init();