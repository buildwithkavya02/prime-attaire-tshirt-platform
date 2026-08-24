import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import Product from "../src/models/Product.js";

// Mirrors src/data/products.ts at the time this backend was built. Per
// spec §13 ("migrate the existing data into MongoDB if practical") — this
// is a one-time migration; from here on, product data lives in the DB and
// is managed from /admin/products.
const PRODUCTS = [
  {
    slug: "round-neck",
    name: "Round Neck Tee",
    description:
      "The everyday essential, cut from heavyweight combed cotton for a clean, structured drape.",
    basePrice: 499,
    front: "/images/product-round-neck-front.png",
    back: "/images/product-round-neck-back.png",
    colors: ["#F8F5F2", "#3E2723", "#5C4033", "#8D6E63", "#C8A165", "#2F241F"],
  },
  {
    slug: "sleeveless",
    name: "Sleeveless Tee",
    description: "Open, breathable and effortless — built for layering or wearing solo in the heat.",
    basePrice: 449,
    front: "/images/product-sleeveless-front.png",
    back: "/images/product-sleeveless-back.png",
    colors: ["#F8F5F2", "#3E2723", "#6D4C41", "#8D6E63", "#C8A165"],
  },
  {
    slug: "polo",
    name: "Polo Shirt",
    description:
      "A refined silhouette with a structured placket and ribbed collar for a smart-casual finish.",
    basePrice: 649,
    front: "/images/product-polo-front.png",
    back: "/images/product-polo-back.png",
    colors: ["#F8F5F2", "#3E2723", "#5C4033", "#6D4C41", "#C8A165", "#2F241F"],
  },
  {
    slug: "hoodie",
    name: "Premium Hoodie",
    description:
      "Brushed fleece interior, adjustable drawcord hood and a kangaroo pocket for everyday warmth.",
    basePrice: 1299,
    front: "/images/product-hoodie-front.png",
    back: "/images/product-hoodie-back.png",
    colors: ["#F8F5F2", "#3E2723", "#5C4033", "#8D6E63", "#2F241F"],
  },
  {
    slug: "full-sleeve",
    name: "Full Sleeve Tee",
    description: "Extended cuffed sleeves and a tailored fit — the year-round layering staple.",
    basePrice: 599,
    front: "/images/product-full-sleeve-front.png",
    back: "/images/product-full-sleeve-back.png",
    colors: ["#F8F5F2", "#3E2723", "#5C4033", "#6D4C41", "#C8A165"],
  },
  {
    slug: "v-neck",
    name: "V-Neck Tee",
    description: "A softer neckline for a relaxed, elongated silhouette without losing structure.",
    basePrice: 529,
    front: "/images/product-v-neck-front.png",
    back: "/images/product-v-neck-back.png",
    colors: ["#F8F5F2", "#3E2723", "#5C4033", "#8D6E63", "#C8A165", "#2F241F"],
  },
];

async function run() {
  await connectDB();

  for (const p of PRODUCTS) {
    await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        ...p,
        type: p.slug, // product slugs already match the type enum values
        status: "active",
        sizes: ["S", "M", "L", "XL", "XXL"],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Upserted product: ${p.slug}`);
  }

  console.log("Product seeding complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
