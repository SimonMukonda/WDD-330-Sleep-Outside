import ProductData from "./ExternalServices.mjs";
import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = []; // Holds the fetched array locally for dynamic sorting
  }

  async init() {
    const list = await this.dataSource.getData(this.category);
    this.products = list; // Cache original data array
    this.renderList(this.products);
  }

  renderList(productList) {
    // Clear out the HTML structure so re-sorted items replace old items instead of stacking
    this.listElement.innerHTML = "";

    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      productList,
      "beforeend",
      true,
    );
  }

  sortList(criteria) {
    // Clone array to prevent direct original state mutations
    let sortedList = [...this.products];

    if (criteria === "name") {
      // Sort alphabetically by the name without brand
      sortedList.sort((a, b) => a.NameWithoutBrand.localeCompare(b.NameWithoutBrand));
    } else if (criteria === "price") {
      // Sort numerically by final purchase price
      sortedList.sort((a, b) => Number(a.FinalPrice) - Number(b.FinalPrice));
    }

    this.renderList(sortedList);
  }
}

function productCardTemplate(product) {
  const isDiscounted =
    Number(product.FinalPrice) < Number(product.SuggestedRetailPrice);
  const savingsAmount = isDiscounted
    ? (
      Number(product.SuggestedRetailPrice) - Number(product.FinalPrice)
    ).toFixed(2)
    : null;
  const savingsPercent = isDiscounted
    ? Math.round(
      ((Number(product.SuggestedRetailPrice) - Number(product.FinalPrice)) /
        Number(product.SuggestedRetailPrice)) *
      100,
    )
    : null;

  const listImg =
    product.Images?.PrimaryMedium ?? product.Image ?? "fallback.jpg";

  return `<li class="product-card${isDiscounted ? " product-card--sale" : ""}">
        <a href="../product_pages/index.html?product=${product.Id}">
            <img src="${listImg}" alt="${product.Name}">
            <h2 class="card__brand">${product.Brand?.Name ?? ""}</h2>
            <h3 class="card__name">${product.NameWithoutBrand}</h3>
            <div class="product-card__pricing">${isDiscounted ? `<span class="price price--retail">$${Number(product.SuggestedRetailPrice).toFixed(2)}</span> ` : ""}
            <span class="price price---final">$${Number(product.FinalPrice).toFixed(2)}</span>${isDiscounted ? `<span class="badge badge--sale">Save $${savingsAmount} (${savingsPercent}% off)</span>` : ""}
          </div>
        </a>
    </li>`;
}