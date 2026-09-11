import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function removeRetiredProducts() {
  return {
    name: "trst-remove-retired-products",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/src/Storefront.jsx")) return null;

      const retiredCheosWorld = /\n  \{\n    id: "cheos-world",[\s\S]*?\n  \},\n(?=  \{\n    id: "no-bad-days")/;
      const transformed = code.replace(retiredCheosWorld, "\n");

      if (transformed === code) {
        throw new Error("Retired Cheo's World product block was not found in Storefront.jsx");
      }

      return { code: transformed, map: null };
    },
  };
}

export default defineConfig({
  plugins: [removeRetiredProducts(), react()],
});
