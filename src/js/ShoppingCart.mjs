// TEAM NOTE:
// This module was created to refactor the shopping cart logic and make it consistent
// with the architecture used in the rest of the application (e.g., ProductList).
//
// Previously, all cart rendering logic lived directly inside cart.js using standalone
// functions. This made the code harder to scale and less consistent with other modules.
//
// Now the shopping cart is encapsulated in a ShoppingCart class that:
//
// - Reads cart data from localStorage
// - Renders cart items dynamically using the shared utility function renderListWithTemplate
// - Uses a template method (cartItemTemplate) to generate HTML for each cart item
// - Calculates and displays the total price
// - Controls visibility of the cart footer (showing it only when items exist)
//
// This refactor improves:
// - Code organization
// - Reusability
// - Consistency across modules
// - Future scalability (e.g., removing items, updating quantities, checkout flow)
//
// The class follows a similar pattern to ProductList:
// constructor → init() → render method → template method.


import { getLocalStorage, setLocalStorage, renderListWithTemplate } from "./utils.mjs";

// Receives references to key DOM elements needed to render the cart:
// - listElement: container where cart items will be inserted
// - footerElement: section that shows total and checkout controls
// - totalElement: element where the calculated total price is displayed

export default class ShoppingCart {
  constructor(listElement, footerElement, totalElement) {
    this.listElement = listElement;
    this.footerElement = footerElement;
    this.totalElement = totalElement;
  }

// Initializes the shopping cart by safely retrieving cart items from localStorage.
// If no cart exists, defaults to an empty array to prevent runtime errors.

  init() {
    const cartItems = getLocalStorage("so-cart") || [];
    this.renderCart(cartItems);
  }

// Renders the cart contents dynamically.
// If items exist, it uses renderListWithTemplate to generate the list,
// calculates the total price using reduce(), and reveals the cart footer.
// If the cart is empty, it displays a fallback message instead.

  renderCart(cartItems) {
    if (cartItems.length > 0) {
      renderListWithTemplate(
        this.cartItemTemplate,
        this.listElement,
        cartItems,
        "afterbegin",
        true
      );

          // Attach listeners to remove buttons
    this.listElement.querySelectorAll(".remove").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        this.removeItem(id);
      });
    });

    // Attach listeners to quantity buttons
    this.listElement.querySelectorAll(".qty-btn").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const action = button.dataset.action;
        this.updateQuantity(id, action);
      });
    });



      const total = cartItems.reduce(
        (sum, item) => sum + Number(item.FinalPrice) * (item.quantity || 1),
        0
      );

      this.footerElement.classList.remove("hide");
      this.totalElement.innerHTML = `Total: $${total.toFixed(2)}`;
    } else {
      this.listElement.innerHTML = "<p>Your cart is empty</p>";
    }
  }

// Template method responsible for generating the HTML structure
// for a single cart item. This keeps markup logic separated from
// rendering logic, following the same pattern used in ProductList.

  cartItemTemplate(item) {
    const image = item.Images?.PrimaryMedium || item.Image;
    return `<li class="cart-card divider">
      <a href="#" class="cart-card__image">
        <img src="${image}" alt="${item.Name}" />
      </a>
      <a href="#">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors[0].ColorName}</p>
      <p class="cart-card__quantity">
        <button class="qty-btn" data-id="${item.Id}" data-action="decrease">-</button>
        <span>${item.quantity || 1}</span>
        <button class="qty-btn" data-id="${item.Id}" data-action="increase">+</button>
      </p>
      <p class="cart-card__price">$${item.FinalPrice}</p>
      <span class="remove" data-id="${item.Id}">X</span> 
    </li>`;  
  }


  removeItem(id) {
    let cartItems = getLocalStorage("so-cart") || [];
    cartItems = cartItems.filter(item => item.Id !== id);
    setLocalStorage("so-cart", cartItems);
    this.renderCart(cartItems);
    if (this.onQuantityChange) this.onQuantityChange();
  }

  updateQuantity(id, action) {
    let cartItems = getLocalStorage("so-cart") || [];
    const item = cartItems.find(item => item.Id === id);
    if (!item) return;

    const currentQty = item.quantity || 1;
    if (action === "increase") {
      item.quantity = currentQty + 1;
    } else if (action === "decrease") {
      if (currentQty <= 1) {
        // Remove item if quantity would go to 0
        cartItems = cartItems.filter(i => i.Id !== id);
      } else {
        item.quantity = currentQty - 1;
      }
    }

    setLocalStorage("so-cart", cartItems);
    this.renderCart(cartItems);
    if (this.onQuantityChange) this.onQuantityChange();
  }
}