import "dotenv/config";
import { db, pool } from "./index.js";
import {
  categoriesTable,
  productsTable,
  usersTable,
  couponsTable
} from "./schema/index.js";
async function seed() {
  console.log("Seeding database...");
  await db.insert(categoriesTable).values([
    { name: "Electronics", slug: "electronics", description: "Phones, laptops and gadgets" },
    { name: "Fashion", slug: "fashion", description: "Clothing and accessories" },
    { name: "Home & Living", slug: "home-living", description: "Furniture and decor" },
    { name: "Beauty", slug: "beauty", description: "Skincare and cosmetics" },
    { name: "Watches", slug: "watches", description: "Luxury and casual watches" },
    { name: "Sports", slug: "sports", description: "Sports and outdoor gear" }
  ]);
  const categories = await db.select().from(categoriesTable);
  const catId = (slug) => categories.find((c) => c.slug === slug).id;
  await db.insert(productsTable).values([
    {
      name: "Wireless Noise-Cancelling Headphones",
      description: "Premium over-ear headphones with active noise cancellation.",
      price: "249.99",
      compareAtPrice: "299.99",
      categoryId: catId("electronics"),
      category: "Electronics",
      brand: "Sonara",
      stock: 35,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"],
      tags: ["audio", "wireless"],
      rating: "4.6",
      reviewCount: 128,
      isFeatured: true,
      isNew: false,
      isBestSeller: true
    },
    {
      name: "Smart Fitness Watch",
      description: "Track your workouts, heart rate and sleep.",
      price: "179.99",
      categoryId: catId("electronics"),
      category: "Electronics",
      brand: "Pulse",
      stock: 50,
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"],
      tags: ["wearable"],
      rating: "4.3",
      reviewCount: 76,
      isNew: true
    },
    {
      name: "Leather Biker Jacket",
      description: "Genuine leather jacket with quilted shoulders.",
      price: "329.0",
      categoryId: catId("fashion"),
      category: "Fashion",
      brand: "Maison Noir",
      stock: 18,
      images: ["https://images.unsplash.com/photo-1520975954732-35dd22299614"],
      tags: ["jacket", "leather"],
      rating: "4.8",
      reviewCount: 54,
      isFeatured: true
    },
    {
      name: "Cashmere Scarf",
      description: "Soft 100% cashmere scarf, available in multiple colors.",
      price: "89.0",
      categoryId: catId("fashion"),
      category: "Fashion",
      brand: "Maison Noir",
      stock: 60,
      images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26"],
      rating: "4.5",
      reviewCount: 33
    },
    {
      name: "Minimalist Oak Coffee Table",
      description: "Solid oak coffee table with a hand-finished surface.",
      price: "415.0",
      categoryId: catId("home-living"),
      category: "Home & Living",
      brand: "Nordwood",
      stock: 12,
      images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c"],
      rating: "4.7",
      reviewCount: 21,
      isBestSeller: true
    },
    {
      name: "Ceramic Vase Set",
      description: "Set of 3 handcrafted ceramic vases.",
      price: "59.99",
      categoryId: catId("home-living"),
      category: "Home & Living",
      brand: "Nordwood",
      stock: 40,
      images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d"],
      rating: "4.2",
      reviewCount: 17
    },
    {
      name: "Vitamin C Brightening Serum",
      description: "Antioxidant serum for radiant, even-toned skin.",
      price: "42.0",
      categoryId: catId("beauty"),
      category: "Beauty",
      brand: "Lumiere",
      stock: 80,
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be"],
      rating: "4.4",
      reviewCount: 95,
      isNew: true
    },
    {
      name: "Matte Lipstick Trio",
      description: "Three long-wear matte lipstick shades.",
      price: "36.0",
      categoryId: catId("beauty"),
      category: "Beauty",
      brand: "Lumiere",
      stock: 70,
      images: ["https://images.unsplash.com/photo-1631214540242-3cd8c4b0b3b8"],
      rating: "4.1",
      reviewCount: 28
    },
    {
      name: "Classic Automatic Watch",
      description: "Swiss-made automatic movement with a sapphire crystal.",
      price: "899.0",
      compareAtPrice: "1099.0",
      categoryId: catId("watches"),
      category: "Watches",
      brand: "Chronova",
      stock: 8,
      images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d"],
      rating: "4.9",
      reviewCount: 41,
      isFeatured: true,
      isBestSeller: true
    },
    {
      name: "Minimalist Steel Watch",
      description: "Slim stainless steel watch for everyday wear.",
      price: "199.0",
      categoryId: catId("watches"),
      category: "Watches",
      brand: "Chronova",
      stock: 25,
      images: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa"],
      rating: "4.3",
      reviewCount: 19
    },
    {
      name: "Performance Running Shoes",
      description: "Lightweight breathable running shoes with extra cushioning.",
      price: "129.0",
      categoryId: catId("sports"),
      category: "Sports",
      brand: "Veloce",
      stock: 60,
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
      rating: "4.5",
      reviewCount: 87,
      isNew: true
    },
    {
      name: "Yoga Mat Pro",
      description: "Extra-thick non-slip yoga mat with carrying strap.",
      price: "49.99",
      categoryId: catId("sports"),
      category: "Sports",
      brand: "Veloce",
      stock: 90,
      images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f"],
      rating: "4.6",
      reviewCount: 63
    }
  ]);
  await db.insert(usersTable).values([
    {
      name: "Alex Morgan",
      email: "alex@example.com",
      passwordHash: "password123",
      role: "customer"
    },
    {
      name: "Admin",
      email: "admin@luxe.com",
      passwordHash: "admin123",
      role: "admin"
    }
  ]);
  await db.insert(couponsTable).values([
    { code: "WELCOME10", type: "percent", value: "10" },
    { code: "LUXE20", type: "percent", value: "20" },
    { code: "FREESHIP", type: "fixed", value: "9.99" },
    { code: "SAVE50", type: "fixed", value: "50" }
  ]);
  console.log("Seed complete:");
  console.log("  - Customer login: alex@example.com / password123");
  console.log("  - Admin login:    admin@luxe.com / admin123");
  await pool.end();
}
seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
