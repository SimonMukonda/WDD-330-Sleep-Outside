import ProductData from "./ExternalServices.mjs";
import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = []; // Keeps track of the loaded products
  }

  async init() {
    // Fetch the list of products from your data source
    this.products = await this.dataSource.getData(this.category);
    // Render the initial list
    this.renderList(this.products);
  }

  renderList(list) {
    // Clear out any old HTML elements first
    this.listElement.innerHTML = "";

    // Generate templates and insert them using our component card builder
    list.forEach(product => {
      const html = productCardTemplate(product);
      this.listElement.insertAdjacentHTML("beforeend", html);
    });
  }

  sortList(criteria) {
    if (criteria === "name") {
      this.products.sort((a, b) => a.Name.localeCompare(b.Name));
    } else if (criteria === "price") {
      this.products.sort((a, b) => Number(a.FinalPrice) - Number(b.FinalPrice));
    }

    // Re-run your rendering method to update the screen display
    this.renderList(this.products);
  }
} // <--- THIS bracket properly closes the ProductList class block!

// Standalone template generator function helper
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