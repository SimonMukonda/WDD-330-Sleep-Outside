import { alertMessage, loadHeaderFooter, setLocalStorage } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";   

// Validation rules for form fields
const validations = [
    {
        id: "firstName",
        errorId: "firstName-error",
        test: (v) => v.trim().length > 0,
        message: "First name is required."
    },
    {
        id: "lastName",
        errorId: "lastName-error",
        test: (v) => v.trim().length > 0,
        message: "Last name is required."
    },
    {
        id: "street",
        errorId: "street-error",
        test: (v) => v.trim().length > 0,
        message: "Street address is required.",
    },
    {
        id: "city",
        errorId: "city-error",
        test: (v) => v.trim().length > 0,
        message: "City is required.",
    },
    {
        id: "state",
        errorId: "state-error",
        test: (v) => /^[A-Za-z\s]+$/.test(v.trim()),
        message: "State must contain only letters and spaces.",
    },
    {
        id: "zip",
        errorId: "zip-error",
        test: (v) => /^\d{5}(-\d{4})?$/.test(v.trim()),
        message: "ZIP code must be in the format 12345 or 12345-6789.",
    },
    {
        id: "cardNumber",
        errorId: "cardNumber-error",
        test: (v) => /^\d{16}$/.test(v.replace(/\s/g, "")),
        message: "Card number must be 16 digits.",
    },
    {
        id: "expiration",
        errorId: "expiration-error",
        test: (v) => {
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim())) {
                return false;
            }
            const [month, year] = v.split("/").map(Number);
            const now = new Date();
            const currentYear = now.getFullYear() % 100;
            const currentMonth = now.getMonth() + 1;
            return year > currentYear || (year === currentYear && month >= currentMonth);
        },
        message: "Expiration date must be in MM/YY format and not expired.",
    },
    {
        id: "securityCode",
        errorId: "securityCode-error",
        test: (v) => /^\d{3,4}$/.test(v.trim()),
        message: "Security code must be 3 or 4 digits.",
    },
  ]; 

function validateForm() {
  let valid = true;
  
    for (const rule of validations) {
        const input = document.getElementById(rule.id);
        const errorEl = document.getElementById(rule.errorId);
        const passes = rule.test(input.value);
    
        if (!passes) {
            errorEl.textContent = rule.message;
            input.classList.add("input-error");
            valid = false;
        } else {
          errorEl.textContent = "";
          input.classList.remove("input-error");
        }
    }

    return valid;
}

// Initializes the checkout process, including loading header/footer and setting up form submission handling
      
async function initCheckout() {
   await loadHeaderFooter();

   const checkout = new CheckoutProcess("so-cart", ".order-summary");
   checkout.init();

    const form = document.getElementById("checkout-form")
    if (!form) return
    
    form.addEventListener("submit", async (evt) => {
        evt.preventDefault();
        if (!validateForm()) {
            return;
        }

        const submitBtn = form.querySelector("[type=\"submit\"]");
        if (submitBtn) submitBtn.disabled = true; // prevent multiple submissions
  
        try {
            await checkout.checkout(form);

        // Success: hide form , show success message, and clear cart
            form.style.display = "none";
            const successMsg = document.getElementById("form-success");    
            if (successMsg) successMsg.style.display = "block";
            setLocalStorage("so-cart", []); // Clear cart after successful checkout
        
        } catch (err) {
          console.error("Checkout failed:", err);
          alertMessage("There was an issue processing your order. Please try again.");
        
        } finally {
          if (submitBtn) submitBtn.disabled = false; // Re-enable submit button
        }

    });
}

window.addEventListener("DOMContentLoaded", initCheckout);
