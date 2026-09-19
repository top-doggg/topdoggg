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

      // The product was removed from the source after this migration guard was
      // introduced. Treat its absence as the intended, already-clean state.
      if (transformed === code) return null;

      return { code: transformed, map: null };
    },
  };
}

export default defineConfig({
  plugins: [removeRetiredProducts(), react()],
});
