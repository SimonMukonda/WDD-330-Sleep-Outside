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
    // 3 render HTML (including our newly embedded carousel container structure)
    this.renderProductDetails();
    // 4 configure button
    this.setupAddToCartButton();
    // 5 process reviews data matching product context
    this.initReviews();
    // 6 process and append historical item carousels
    this.trackRecentProduct();
    this.renderRecentProducts();
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
  }

  setupAddToCartButton() {
    const btn = document.getElementById("addToCart");
    if (btn) {
      btn.addEventListener("click", () => {
        this.addProductToCart();
      });
    }
  }

  trackRecentProduct() {
    let recentProducts = JSON.parse(localStorage.getItem("so-recently-viewed")) || [];
    // Filter out current ID to keep position shifting modern and avoid duplication
    recentProducts = recentProducts.filter(id => id !== this.productId);
    // Unshift to place at front of carousel queue
    recentProducts.unshift(this.productId);

    // Maintain a strict viewport cap limit of 4 historic records
    if (recentProducts.length > 4) {
      recentProducts.pop();
    }
    localStorage.setItem("so-recently-viewed", JSON.stringify(recentProducts));
  }

  async renderRecentProducts() {
    const recentIds = JSON.parse(localStorage.getItem("so-recently-viewed")) || [];
    const listElement = document.getElementById("recentlyViewedList");
    const sectionElement = document.querySelector(".recently-viewed");
    if (!listElement || !sectionElement) return;

    listElement.innerHTML = "";

    // Hide entire block wrapper if only viewing your first item of the browser session
    if (recentIds.length <= 1) {
      sectionElement.style.display = "none";
      return;
    }

    // Populate thumbnails matching previous arrays
    for (const id of recentIds) {
      if (id === this.productId) continue;

      try {
        const itemData = await this.dataSource.findProductById(id);
        const cardHtml = this.recentCardTemplate(itemData);
        listElement.insertAdjacentHTML("beforeend", cardHtml);
      } catch (err) {
        console.error(`Error loading recent dynamic element asset details: ${id}`, err);
      }
    }
  }

  recentCardTemplate(product) {
    return `
      <li class="recent-card">
        <a href="../product_pages/index.html?product=${product.Id}">
          <img src="${product.Images?.PrimaryMedium || product.Image || 'fallback.jpg'}" alt="${product.Name}">
          <h3 class="recent-brand">${product.Brand?.Name || 'Gear'}</h3>
          <p class="recent-name">${product.NameWithoutBrand}</p>
          <p class="recent-price">$${product.FinalPrice || product.ListPrice}</p>
        </a>
      </li>
    `;
  }

  initReviews() {
    const productId = this.product.Id || this.productId || "default-product";

    const defaultReviews = [
      { name: "Alex K.", rating: 5, text: "Absolutely loved using this tent on my last trek. Lightweight and completely waterproof!", date: "May 12, 2026" },
      { name: "Sarah M.", rating: 4, text: "Great build quality. Setup took a little longer than expected, but overall highly recommend.", date: "May 18, 2026" }
    ];

    const render = () => {
      let reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`));
      if (!reviews) {
        reviews = defaultReviews;
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
      }

      const container = document.getElementById('reviewsContainer');
      if (container) {
        container.innerHTML = reviews.map(review => `
          <div class="review-card">
            <div class="review-header">
              <span class="review-name">${review.name}</span>
              <span class="review-date">${review.date}</span>
            </div>
            <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <p class="review-text">${review.text}</p>
          </div>
        `).join('');
      }

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const average = (totalRating / reviews.length).toFixed(1);
        const roundedStars = Math.round(average);

        const starsEl = document.getElementById('averageStars');
        const textEl = document.getElementById('averageRatingText');

        if (starsEl) starsEl.innerText = '★'.repeat(roundedStars) + '☆'.repeat(5 - roundedStars);
        if (textEl) textEl.innerText = `${average} out of 5 stars (${reviews.length} reviews)`;
      }
    };

    render();

    const form = document.getElementById('reviewForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('reviewerName').value;
        const textInput = document.getElementById('reviewText').value;
        const ratingChecked = document.querySelector('input[name="rating"]:checked');
        const ratingInput = ratingChecked ? ratingChecked.value : 5;

        const newReview = {
          name: nameInput,
          rating: parseInt(ratingInput),
          text: textInput,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
        reviews.push(newReview);
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));

        form.reset();
        render();
      });
    }
  }

  renderProductDetails() {
    const main = document.querySelector("main");
    main.innerHTML = `
  <section class="product-detail">
    <h3>${this.product.Brand?.Name || "Brand"}</h3>
    <h2>${this.product.NameWithoutBrand}</h2>
    <button id="addToCart">Add to Cart</button>
    <img src="${this.product.Images?.PrimaryLarge ?? this.product.Image ?? "fallback.jpg"}" alt="${this.product.Name}">
    <p class="product-card__price">$${this.product.FinalPrice}</p>
    <p class="product__color">${this.product.Colors?.[0]?.ColorName || "Default Color"}</p>
    <div class="product__description">
      ${this.product.DescriptionHtmlSimple}
    </div>
  </section>
  
  <section class="product-reviews">
    <h2>Customer Reviews</h2>
    <div class="rating-summary">
      <div class="average-stars" id="averageStars"></div>
      <span id="averageRatingText">0.0 out of 5 stars</span>
    </div>
    <div id="reviewsContainer" class="reviews-container"></div>
    <form id="reviewForm" class="review-form">
      <h3>Write a Review</h3>
      
      <label for="reviewerName">Name</label>
      <input type="text" id="reviewerName" required placeholder="Your name...">

      <label>Your Rating</label>
      <div class="star-rating-input">
        <input type="radio" id="star5" name="rating" value="5" required><label for="star5" title="5 stars">★</label>
        <input type="radio" id="star4" name="rating" value="4"><label for="star4" title="4 stars">★</label>
        <input type="radio" id="star3" name="rating" value="3"><label for="star3" title="3 stars">★</label>
        <input type="radio" id="star2" name="rating" value="2"><label for="star2" title="2 stars">★</label>
        <input type="radio" id="star1" name="rating" value="1"><label for="star1" title="1 star">★</label>
      </div>

      <label for="reviewText">Review</label>
      <textarea id="reviewText" rows="4" required placeholder="What did you like or dislike about this gear?"></textarea>

      <button type="submit" id="submitReviewBtn">Submit Review</button>
    </form>
  </section>

  <section class="recently-viewed">
    <h2>Recently Viewed Items</h2>
    <div class="carousel-container">
      <ul id="recentlyViewedList" class="carousel-grid">
        </ul>
    </div>
  </section>`;
  }
}