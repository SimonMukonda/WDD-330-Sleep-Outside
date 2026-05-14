import ProductData from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { updateCartCount } from "./cartIndicator.mjs";
import { loadHeaderFooter, showWelcomeBanner } from "./utils.mjs";
import Alert from "./Alert";

const productData = new ProductData("tents");
const productList = new ProductList(
  "tents",
  productData,
  document.querySelector(".product-list"),
);

async function init() {
  await loadHeaderFooter();
  updateCartCount();

  productList.init();

  const alert = new Alert("/json/alerts.json");
  alert.loadAlerts();

  showWelcomeBanner();
}

init();