import { getLocalStorage } from "./utils.mjs";
import ProductData from "./ExternalServices.mjs";

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSubTotal();
    this.calculateOrderTotal();
  }

  calculateItemSubTotal() {
    // Sum item totals.
    this.itemTotal = this.list.reduce((sum, item) => sum + Number(item.FinalPrice) * (item.quantity || 1), 0);
 
    const subtotalElement = document.querySelector(
      `${this.outputSelector} #subtotal`
    );
    const itemCountElement = document.querySelector(
      `${this.outputSelector} #itemCount`
    );
 
    if (subtotalElement) subtotalElement.innerText = `$${this.itemTotal.toFixed(2)}`;
    if (itemCountElement) {
      const count = this.list.reduce((sum, item) => sum + (item.quantity || 1), 0);
      itemCountElement.innerText = count;
    }
  }
  
  calculateOrderTotal() {
    const itemCount = this.list.reduce((sum, item) => sum + (item.quantity || 1), 0);

    this.tax = (this.itemTotal * 0.06)
    this.shipping = itemCount > 0 ? 10 + (itemCount - 1) * 2 : 0;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;
 

    // display the totals.
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    // once the totals are all calculated display them in the order summary page
    const taxElement = document.querySelector(`${this.outputSelector} #tax`);
    const shippingElement = document.querySelector(
      `${this.outputSelector} #shipping`
    );
    const orderTotalElement = document.querySelector(
      `${this.outputSelector} #orderTotal`
    );
 
    if (taxElement) taxElement.innerText = `$${this.tax.toFixed(2)}`;
    if (shippingElement) shippingElement.innerText = `$${this.shipping.toFixed(2)}`;
    if (orderTotalElement) orderTotalElement.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout(form) {
    const order = formDataToJSON(form);
    order.orderDate = new Date().toISOString();
    order.items = packageItems(this.list);
    order.orderTotal = this.orderTotal.toFixed(2);
    order.shipping = this.shipping;
    order.tax = this.tax.toFixed(2);
 
    const services = new ProductData();
    const result = await services.checkout(order);
    return result;
  }
}  

// Helpers   
function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: Number(item.FinalPrice),
    quantity: item.quantity || 1,
  }));
}

// takes a form element and returns an object where the key is the "name" of the form input.
function formDataToJSON(formElement) {
  const formData = new FormData(formElement),
    convertedJSON = {};

  formData.forEach(function (value, key) {
    convertedJSON[key] = value;
  });

  return convertedJSON;
} 
    
