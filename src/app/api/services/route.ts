import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const category = searchParams.get("category");
    const search   = searchParams.get("q");

    const where: any = { isActive: true };
    if (platform) where.platform = platform;
    if (category) where.categoryId = category;
    if (search)   where.name = { contains: search, mode: "insensitive" };

    const services = await prisma.service.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { pricePerThousand: "asc" }],
    });

    return NextResponse.json({ services });
  } catch (err) {
    console.error("[SERVICES GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
