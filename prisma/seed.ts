import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminHash = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@socialboostgh.com" },
    update: {},
    create: {
      name:          "Admin",
      email:         "admin@socialboostgh.com",
      password:      adminHash,
      role:          "ADMIN",
      emailVerified: new Date(),
      referralCode:  "SBADMIN001",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "tiktok-followers" }, update: {}, create: { name: "TikTok Followers", slug: "tiktok-followers", platform: "tiktok", sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: "tiktok-likes" },     update: {}, create: { name: "TikTok Likes",     slug: "tiktok-likes",     platform: "tiktok", sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: "tiktok-views" },     update: {}, create: { name: "TikTok Views",     slug: "tiktok-views",     platform: "tiktok", sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: "youtube-subs" },     update: {}, create: { name: "YouTube Subscribers", slug: "youtube-subs", platform: "youtube", sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: "youtube-views" },    update: {}, create: { name: "YouTube Views",    slug: "youtube-views",    platform: "youtube", sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: "instagram-followers" }, update: {}, create: { name: "Instagram Followers", slug: "instagram-followers", platform: "instagram", sortOrder: 6 } }),
    prisma.category.upsert({ where: { slug: "facebook-likes" },   update: {}, create: { name: "Facebook Likes",   slug: "facebook-likes",   platform: "facebook", sortOrder: 7 } }),
    prisma.category.upsert({ where: { slug: "twitter-followers" }, update: {}, create: { name: "X Followers",     slug: "twitter-followers", platform: "twitter", sortOrder: 8 } }),
    prisma.category.upsert({ where: { slug: "telegram-members" }, update: {}, create: { name: "Telegram Members", slug: "telegram-members", platform: "telegram", sortOrder: 9 } }),
  ]);
  console.log("✅ Categories created:", categories.length);

  // Create services
  const SERVICES = [
    { name: "TikTok Followers — High Quality", categorySlug: "tiktok-followers", platform: "tiktok", pricePerThousand: 2.50, minQuantity: 100, maxQuantity: 1000000, estimatedDays: "1-6 hours", qualityBadge: "High Quality" },
    { name: "TikTok Likes — Instant",          categorySlug: "tiktok-likes",    platform: "tiktok", pricePerThousand: 0.80, minQuantity: 50,  maxQuantity: 500000,  estimatedDays: "0-1 hour",  qualityBadge: "Instant" },
    { name: "TikTok Views — Instant",          categorySlug: "tiktok-views",    platform: "tiktok", pricePerThousand: 0.30, minQuantity: 500, maxQuantity: 5000000, estimatedDays: "0-30 min",  qualityBadge: "Instant" },
    { name: "YouTube Subscribers — Real",      categorySlug: "youtube-subs",    platform: "youtube", pricePerThousand: 12.0, minQuantity: 100, maxQuantity: 100000, estimatedDays: "24-72 hours", qualityBadge: "High Quality" },
    { name: "YouTube Views — Fast",            categorySlug: "youtube-views",   platform: "youtube", pricePerThousand: 1.50, minQuantity: 500, maxQuantity: 5000000, estimatedDays: "0-2 hours", qualityBadge: "Instant" },
    { name: "Instagram Followers — Premium",   categorySlug: "instagram-followers", platform: "instagram", pricePerThousand: 4.00, minQuantity: 100, maxQuantity: 500000, estimatedDays: "1-12 hours", qualityBadge: "Premium" },
    { name: "Facebook Post Likes",             categorySlug: "facebook-likes",  platform: "facebook", pricePerThousand: 2.00, minQuantity: 50,  maxQuantity: 200000, estimatedDays: "0-6 hours", qualityBadge: "High Quality" },
    { name: "X (Twitter) Followers",           categorySlug: "twitter-followers", platform: "twitter", pricePerThousand: 5.00, minQuantity: 100, maxQuantity: 100000, estimatedDays: "1-24 hours", qualityBadge: "High Quality" },
    { name: "Telegram Channel Members",        categorySlug: "telegram-members", platform: "telegram", pricePerThousand: 6.00, minQuantity: 100, maxQuantity: 500000, estimatedDays: "1-24 hours", qualityBadge: "High Quality" },
  ];

  for (const svc of SERVICES) {
    const cat = categories.find((c) => c.slug === svc.categorySlug);
    if (!cat) continue;
    await prisma.service.upsert({
      where:  { id: `seed-${svc.name.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}` },
      update: {},
      create: {
        id:              `seed-${svc.name.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}`,
        name:            svc.name,
        categoryId:      cat.id,
        platform:        svc.platform,
        pricePerThousand: svc.pricePerThousand,
        minQuantity:     svc.minQuantity,
        maxQuantity:     svc.maxQuantity,
        estimatedDays:   svc.estimatedDays,
        qualityBadge:    svc.qualityBadge,
        isActive:        true,
        isFeatured:      true,
      },
    });
  }
  console.log("✅ Services seeded:", SERVICES.length);

  // Sample coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code:          "WELCOME20",
      description:   "Welcome bonus — 20% off first order",
      discountType:  "percentage",
      discountValue: 20,
      maxUses:       1000,
      isActive:      true,
      expiresAt:     new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });
  console.log("✅ Coupon created: WELCOME20");

  // Sample announcement
  await prisma.announcement.upsert({
    where: { id: "welcome-announcement" },
    update: {},
    create: {
      id:       "welcome-announcement",
      title:    "🎉 Welcome to SocialBoost GH!",
      content:  "Use code WELCOME20 for 20% off your first order. Fast delivery, real engagement, 24/7 support!",
      type:     "success",
      isActive: true,
    },
  });
  console.log("✅ Announcement created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Admin Email:    admin@socialboostgh.com");
  console.log("   Admin Password: Admin@123456");
  console.log("   Coupon Code:    WELCOME20 (20% off)");
}

main()
  .catch((err) => { console.error("❌ Seed error:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
