import { getLocalStorage } from "./utils.mjs";

export function updateCartCount() {
  const badge = document.querySelector(".cart-count");
  if (!badge) return; // Exit if no badge element is found
    
  const cart = getLocalStorage("so-cart") || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0); // adjust if you store quantities later
    
    if (count > 0) {
        badge.textContent = count;
        badge.classList.add("is-visible");
    } else {
        badge.classList.remove("is-visible");
    }
}    
