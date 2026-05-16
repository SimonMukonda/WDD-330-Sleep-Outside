import ProductData from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

loadHeaderFooter();

const category = getParam("category") ?? "tents";

// Turn "sleeping-bags" into "Sleeping Bags" for display purposes
const categoryLabel = category
  .replace(/-/g, " ")
  .replace(/\b\w/g, (c) => c.toUpperCase());

const titleSpan = document.querySelector(".title");
if (titleSpan) titleSpan.textContent = categoryLabel;

const dataSource = new ProductData();
const element = document.querySelector(".product-list");
const listing = new ProductList(category, dataSource, element);
listing.init();

// Event Listener for the Product Sorting Dropdown
const sortSelect = document.querySelector("#sort-select");
if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    const criterion = e.target.value;
    // Call our newly created sorting method inside the ProductList instance
    listing.sortList(criterion);
  });
}
