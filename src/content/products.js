// src/content/products.js
// Product records for TRST Studios / DE.LA.COSTA Edition 001.
// Source: approved Printify mockups pulled live in Storefront modal.
// Do not invent products, pricing, or availability.

export const catalogCheckedAt = "2026-10-31";

export const allProducts = [
  {
    id: "de-los-cielos", name: "De Los Cielos Tee", price: "$29.58", badge: "New release",
    story: "Aztec sun and warrior imagery inspired by Mexican heritage, memory, and the spirit of the corrido.",
    fit: "Relaxed classic fit", sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    care: "Wash cold. Do not bleach or tumble dry. Iron on low, away from the print.",
    printifyProductId: "33676373",
    image: "https://images-api.printify.com/mockup/6ae2f2516f50fa523607489d/247305/127573/de-los-cielos-aztec-sun-mexican-heritage-graphic-t-shirt.jpg?camera_label=front&revision=1793258617972",
    backImage: "https://images-api.printify.com/mockup/6ae2f2516f50fa523607489d/247305/127574/de-los-cielos-aztec-sun-mexican-heritage-graphic-t-shirt.jpg?camera_label=back&revision=1793258617972",
  },
  {
    id: "the-realest-feeling", name: "The Realest Feeling Tee", price: "$25.99", badge: "New release",
    story: "An ornate warrior mask and expressive botanical forms on a heavyweight garment-dyed tee. A graphic about pain, resilience, and carrying on.",
    fit: "Relaxed fit / garment-dyed cotton", sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"], previewView: "back",
    care: "Wash cold. Do not bleach. Tumble dry low. Iron on low, away from the print.",
    printifyProductId: "33675910",
    image: "https://images-api.printify.com/mockup/6ae2e94f8c0e53cc7b0d9b62/73204/98445/the-realest-feeling-graphic-t-shirt-enduring-pain-heartbreak-design.jpg?camera_label=front&revision=1793258653433",
    backImage: "https://images-api.printify.com/mockup/6ae2e94f8c0e53cc7b0d9b62/73204/98446/the-realest-feeling-graphic-t-shirt-enduring-pain-heartbreak-design.jpg?camera_label=back&revision=1793258653433",
  },

  {
    id: "capistrano-love",
    name: "Capistrano Love Tee",
    price: "$31.01",
    badge: "New release",
    story: "A vintage surf and tropical graphic built around the town, its coast, and the feeling of carrying Capistrano with you.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a78fdf747d9c5b8a60c79d7/78973/98445/capistrano-love-t-shirt-vintage-surf-tropical-graphic-tee.jpg?camera_label=front",
    backImage: "https://images-api.printify.com/mockup/6a78fdf747d9c5b8a60c79d7/78973/98446/capistrano-love-t-shirt-vintage-surf-tropical-graphic-tee.jpg?camera_label=back",
  },
  {
    id: "cheos-world",
    name: "Cheo's World Blue Portrait Tee",
    price: "$31.01",
    badge: "Community portrait",
    story: "A blue vintage portrait drawn from Cheo's World—neighborhood memory held as an image meant to stay in motion.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a78f8fd6c30b14e8401411f/73207/98445/cheos-world-blue-vintage-portrait-t-shirt.jpg?camera_label=front",
    backImage: "https://images-api.printify.com/mockup/6a78f8fd6c30b14e8401411f/73207/98446/cheos-world-blue-vintage-portrait-t-shirt.jpg?camera_label=back",
  },
  {
    id: "no-bad-days",
    name: "No Bad Days For A Warrior Tee",
    price: "$29.05",
    badge: "Daily uniform",
    story: "A direct reminder made for everyday wear: resilience is a practice, not a mood.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a62444306936faf06051c77/79083/98445/no-bad-days-for-a-warrior-tee.jpg?camera_label=front",
    backImage: "https://images-api.printify.com/mockup/6a62444306936faf06051c77/79083/98446/no-bad-days-for-a-warrior-tee.jpg?camera_label=back",
  },
  {
    id: "sin-miedo",
    name: "Sin Miedo Tee",
    price: "$29.45",
    badge: "Edition 001",
    story: "A fearless street-art statement made to carry the message without explanation.",
    fit: "Classic unisex fit",
    image: "https://images-api.printify.com/mockup/6a5eeeab91d18ea0270d1d03/12100/92570/sin-miedo-graphic-tee-urban-street-art-t-shirt.jpg?camera_label=front",
    backImage: "https://images-api.printify.com/mockup/6a5eeeab91d18ea0270d1d03/12100/92571/sin-miedo-graphic-tee-urban-street-art-t-shirt.jpg?camera_label=back",
  },
];

export const products = allProducts.filter((product) => product.id !== "cheos-world");

export function productById(id) {
  return products.find((product) => product.id === id);
}
