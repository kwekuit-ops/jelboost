/**
 * POST /api/admin/sync-provider
 * Fetches all services from BoostLegit and upserts them into the local DB.
 * Admin only.
 */
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProviderServices, getProviderBalance } from "@/lib/providers/boostlegit";
import { USD_TO_GHS_RATE } from "@/lib/utils";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function detectPlatform(category: string, name: string): string {
  const str = `${category} ${name}`.toLowerCase();
  if (str.includes("tiktok"))    return "tiktok";
  if (str.includes("youtube"))   return "youtube";
  if (str.includes("instagram")) return "instagram";
  if (str.includes("facebook"))  return "facebook";
  if (str.includes("twitter") || str.includes("tweet") || str.includes(" x ")) return "twitter";
  if (str.includes("telegram"))  return "telegram";
  if (str.includes("spotify"))   return "spotify";
  if (str.includes("snapchat"))  return "snapchat";
  return "other";
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const selectedServiceIds = Array.isArray(body.serviceIds) ? new Set(body.serviceIds.map(String)) : null;

    // Ensure BoostLegit exists in ApiProvider table
    let provider = await prisma.apiProvider.findFirst({
      where: { name: "BoostLegit" }
    });

    if (provider) {
      provider = await prisma.apiProvider.update({
        where: { id: provider.id },
        data: { apiUrl: "https://boostlegit.com/api/v2", isActive: true }
      });
    } else {
      provider = await prisma.apiProvider.create({
        data: {
          name:        "BoostLegit",
          apiUrl:      "https://boostlegit.com/api/v2",
          apiKey:      process.env.BOOSTLEGIT_API_KEY || "",
          description: "BoostLegit SMM provider",
          isActive:    true,
        }
      });
    }

    let services = await getProviderServices();
    
    if (selectedServiceIds) {
      // Filter services to only include the selected ones
      services = services.filter((svc: any) => selectedServiceIds.has(String(svc.service)));
    }

    let created = 0;
    let updated = 0;

    // 1. Get/Create all unique categories from the provider first
    const uniqueCategories = Array.from(new Set(services.map(s => s.category)));
    const categoryMap = new Map<string, string>(); // name -> id

    // Fetch existing categories to avoid redundant creations
    const existingCats = await prisma.category.findMany();
    for (const c of existingCats) {
      categoryMap.set(c.name, c.id);
    }

    // Create missing categories in bulk or sequentially (small number usually)
    for (const catName of uniqueCategories) {
      if (!categoryMap.has(catName)) {
        const platform = detectPlatform(catName, "");
        const catSlug = slugify(catName) || `cat-${Date.now()}-${Math.random()}`;
        const newCat = await prisma.category.create({
          data: { name: catName, slug: catSlug, platform, description: catName, isActive: true },
        });
        categoryMap.set(catName, newCat.id);
      }
    }

    // 2. Fetch all existing provider services to know what to create vs update
    const existingServices = await prisma.service.findMany({
      where: { apiProviderId: provider.id },
      select: { id: true, externalServiceId: true },
    });
    const existingServiceMap = new Map<string, string>(); // externalId -> id
    for (const s of existingServices) {
      if (s.externalServiceId) existingServiceMap.set(s.externalServiceId, s.id);
    }

    // 3. Process services
    const newServicesData: any[] = [];
    
    for (const svc of services) {
      // svc.rate is in USD. Convert to GHS and apply 50% markup (1.5x)
      const costInGhs = parseFloat(svc.rate) * USD_TO_GHS_RATE;
      const pricePerThousand = costInGhs * 1.5;

      const platform = detectPlatform(svc.category, svc.name);
      const categoryId = categoryMap.get(svc.category)!;
      const externalId = String(svc.service);

      const existingId = existingServiceMap.get(externalId);

      if (existingId) {
        await prisma.service.update({
          where: { id: existingId },
          data: {
            name:             svc.name,
            pricePerThousand: pricePerThousand,
            minQuantity:      parseInt(svc.min),
            maxQuantity:      parseInt(svc.max),
            categoryId,
            platform,
          },
        });
        updated++;
      } else {
        newServicesData.push({
          name:              svc.name,
          externalServiceId: externalId,
          pricePerThousand:  pricePerThousand,
          minQuantity:       parseInt(svc.min),
          maxQuantity:       parseInt(svc.max),
          categoryId,
          apiProviderId:     provider.id,
          platform,
          isActive:          true,
          isFeatured:        false,
        });
      }
    }

    if (newServicesData.length > 0) {
      await prisma.service.createMany({
        data: newServicesData,
        skipDuplicates: true,
      });
      created = newServicesData.length;
    }

    // Also return current balance
    const balance = await getProviderBalance();

    return NextResponse.json({
      success:        true,
      total:          services.length,
      created,
      updated,
      providerBalance: balance,
    });
  } catch (err: any) {
    console.error("[SYNC-PROVIDER]", err);
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const balance = await getProviderBalance();
    return NextResponse.json({ balance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
