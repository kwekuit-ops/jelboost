import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name:             z.string().min(3),
  platform:         z.string().min(1),
  pricePerThousand: z.coerce.number().positive(),
  minQuantity:      z.coerce.number().int().positive(),
  maxQuantity:      z.coerce.number().int().positive(),
  estimatedDays:    z.string().optional(),
  qualityBadge:     z.string().optional(),
  description:      z.string().optional(),
  isActive:         z.boolean().default(true),
  isFeatured:       z.boolean().default(false),
});

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN","SUPER_ADMIN"].includes((session.user as any)?.role)) {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const page     = parseInt(searchParams.get("page") || "1");
  const limit    = parseInt(searchParams.get("limit") || "50");

  const where: any = {};
  if (platform) where.platform = platform;

  const [services, total] = await Promise.all([
    prisma.service.findMany({ where, include: { category: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], skip: (page-1)*limit, take: limit }),
    prisma.service.count({ where }),
  ]);

  return NextResponse.json({ services, total });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.parse(body);

    // Find or create category
    let category = await prisma.category.findFirst({
      where: { platform: parsed.platform },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name:     `${parsed.platform.charAt(0).toUpperCase() + parsed.platform.slice(1)} Services`,
          slug:     `${parsed.platform}-services-${Date.now()}`,
          platform: parsed.platform,
        },
      });
    }

    const service = await prisma.service.create({
      data: { ...parsed, categoryId: category.id },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    console.error("[ADMIN SERVICES POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
