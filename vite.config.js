import { resolve } from "path";
import { defineConfig } from "vite";

const src = (...segments) => resolve(__dirname, "src", ...segments);

export default defineConfig({
  root: "src/",
  envDir: "../",
  publicDir: "../public",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: src("index.html"),
        cart: src("cart/index.html"),
        checkout: src("checkout/index.html"),
        product: src("product_pages/index.html"),
        product_listing: src("product_listing/index.html"),
      },
    },
  },
});
