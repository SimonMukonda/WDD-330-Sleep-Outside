import ProductData from "./ExternalServices.mjs";
import { renderListWithTemplate } from "./utils.mjs";

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.list = [];
  }

  async init() {
    const list = await this.dataSource.getData(this.category);
    this.list = list;
    this.renderList(this.list);
  }

  renderList(productList) {

    this.listElement.innerHTML = "";

    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      productList,
      "beforeend",
      true,
    );
  }


  sortList(criterion) {
    if (criterion === "name") {
      this.list.sort((a, b) => a.Name.localeCompare(b.Name));
    } else if (criterion === "price") {
      this.list.sort((a, b) => Number(a.FinalPrice) - Number(b.FinalPrice));
    }


    this.listElement.innerHTML = "";


    this.renderList(this.list);
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