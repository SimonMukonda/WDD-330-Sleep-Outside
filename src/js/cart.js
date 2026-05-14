import {loadHeaderFooter} from "./utils.mjs";
import { updateCartCount } from "./cartIndicator.mjs";
import ShoppingCart from "./ShoppingCart.mjs";

loadHeaderFooter();
updateCartCount();

const productList = document.querySelector(".product-list");
const cartFooter = document.querySelector(".cart-footer");
const cartTotal = document.querySelector(".cart-total");

const shoppingCart = new ShoppingCart(productList, cartFooter, cartTotal);
shoppingCart.onQuantityChange = () => updateCartCount();
shoppingCart.init();