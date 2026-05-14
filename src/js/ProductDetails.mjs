import { updateCartCount } from "./cartIndicator.mjs";
import { alertMessage, getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
    this.product = {};
  }
  async init() {
    // 1 search the product
    const product = await this.dataSource.findProductById(this.productId);
    // 2 save the product
    this.product = product;
    // 3 render HTML
    this.renderProductDetails();
    // 4 configure button
    this.setupAddToCartButton();
  }

  addProductToCart() {
    const cart = getLocalStorage("so-cart") || [];

    const existing = cart.find((item) => item.Id === this.product.Id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({
        ...this.product,
        quantity: 1,
      });
    }

    setLocalStorage("so-cart", cart);
    updateCartCount(); // refresh badge immediately after adding to cart
    alertMessage(`${this.product.NameWithoutBrand} has been added to your cart!`);
    // animateCartIcon();
  }

  setupAddToCartButton() {
    const btn = document.getElementById("addToCart");
    if (btn) {
      btn.addEventListener("click", () => {
        this.addProductToCart();
      });
    }
  }

  renderProductDetails() {
    const main = document.querySelector("main");
    main.innerHTML = `
  <section class="product-detail">
    <h3>${this.product.Brand.Name}</h3>
    <h2>${this.product.NameWithoutBrand}</h2>
    <button id="addToCart">Add to Cart</button>
    <img src="${this.product.Images?.PrimaryLarge ?? this.product.Image ?? "fallback.jpg"}" alt="${this.product.Name}">
    <p class="product-card__price">$${this.product.FinalPrice}</p>
    <p class="product__color">${this.product.Colors[0].ColorName}</p>
    <div class="product__description">
      ${this.product.DescriptionHtmlSimple}
    </div>
  </section>`;
  }
}

