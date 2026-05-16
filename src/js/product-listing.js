import ProductData from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

loadHeaderFooter();

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

// Use a clean, global window-level event listener check
document.addEventListener("change", (event) => {
  if (event.target && event.target.id === "sort-select") {
    const criteria = event.target.value;
    if (criteria) {
      listing.sortList(criteria);
    }
  }
});