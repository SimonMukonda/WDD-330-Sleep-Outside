import ProductData from "./ExternalServices.mjs";
import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = []; // Cached array
  }

  async init() {
    const list = await this.dataSource.getData(this.category);
    this.products = list;
    this.renderList(this.products);
  }

  renderList(productList) {
    // Wipe only the inner contents safely
    this.listElement.innerHTML = "";

    // Re-verify we have data before looping
    if (productList && productList.length > 0) {
      renderListWithTemplate(
        productCardTemplate,
        this.listElement,
        productList,
        "beforeend",
        true,
      );
    }
  }

  sortList(criteria) {
    // Shallow copy to prevent mutating the state array directly
    let sortedList = [...this.products];

    if (criteria === "name") {
      sortedList.sort((a, b) => a.NameWithoutBrand.localeCompare(b.NameWithoutBrand));
    } else if (criteria === "price") {
      sortedList.sort((a, b) => Number(a.FinalPrice) - Number(b.FinalPrice));
    }

    // Fire the rendering sequence with our updated array ordering
    this.renderList(sortedList);
  }
}

function productCardTemplate(product) {
  const isDiscounted = Number(product.FinalPrice) < Number(product.SuggestedRetailPrice);
  const savingsAmount = isDiscounted ? (Number(product.SuggestedRetailPrice) - Number(product.FinalPrice)).toFixed(2) : null;
  const savingsPercent = isDiscounted ? Math.round(((Number(product.SuggestedRetailPrice) - Number(product.FinalPrice)) / Number(product.SuggestedRetailPrice)) * 100) : null;
  const listImg = product.Images?.PrimaryMedium ?? product.Image ?? "fallback.jpg";

  return `<li class="product-card${isDiscounted ? " product-card--sale" : ""}">
        <a href="../product_pages/index.html?product=${product.Id}">
            <img src="${listImg}" alt="${product.Name}">
            <h2 class="card__brand">${product.Brand?.Name ?? ""}</h2>
            <h3 class="card__name">${product.NameWithoutBrand}</h3>
            <div class="product-card__pricing">
              ${isDiscounted ? `<span class="price price--retail">$${Number(product.SuggestedRetailPrice).toFixed(2)}</span> ` : ""}
              <span class="price price---final">$${Number(product.FinalPrice).toFixed(2)}</span>
              ${isDiscounted ? `<span class="badge badge--sale">Save $${savingsAmount} (${savingsPercent}% off)</span>` : ""}
            </div>
        </a>
    </li>`;
}