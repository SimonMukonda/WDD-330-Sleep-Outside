import { getParam, loadHeaderFooter } from "./utils.mjs";
import ProductData from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { updateCartCount } from "./cartIndicator.mjs";

const productId = getParam("product");
const dataSource = new ProductData();
const product = new ProductDetails(productId, dataSource);

async function init() {
  await loadHeaderFooter();
  updateCartCount();
  product.init();
}

init();