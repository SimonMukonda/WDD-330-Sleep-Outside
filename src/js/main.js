import ProductData from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { updateCartCount } from "./cartIndicator.mjs";
import { loadHeaderFooter, showWelcomeBanner } from "./utils.mjs";
import Alert from "./Alert.js";

const productData = new ProductData("tents");
const listElement = document.querySelector(".product-list");

// Only creates the product list instance if the target element exists in the DOM
let productList = null;
if (listElement) {
  productList = new ProductList("tents", productData, listElement);
}

async function init() {
  await loadHeaderFooter();
  updateCartCount();

  // Guard clause: Only initialize if productList was successfully created
  if (productList) {
    productList.init();
  }

  const alert = new Alert("/json/alerts.json");
  alert.loadAlerts();

  showWelcomeBanner();
}

init();