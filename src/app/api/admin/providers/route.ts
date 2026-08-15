import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { z } from "zod";

const createSchema = z.object({
  name:        z.string().min(2),
  apiUrl:      z.string().url(),
  apiKey:      z.string().min(4),
  description: z.string().optional(),
});

const fetchSchema = z.object({
  apiUrl: z.string().url(),
  apiKey: z.string().min(4),
});

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session && ["ADMIN","SUPER_ADMIN"].includes((session.user as any)?.role);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const action = body.action; // "create" or "fetch_services"

    if (action === "fetch_services") {
      const parsed = fetchSchema.parse(body);
      // Typical SMM panel API format (JAP, Peakerr, PerfectPanel etc.)
      // POST to API URL with { key: API_KEY, action: "services" }
      const res = await axios.post(parsed.apiUrl, {
        key:    parsed.apiKey,
        action: "services",
      }, { headers: { "Content-Type": "application/json" } });

      if (Array.isArray(res.data)) {
        return NextResponse.json({ services: res.data });
      } else if (res.data?.error) {
        return NextResponse.json({ error: res.data.error }, { status: 400 });
      } else {
        return NextResponse.json({ error: "Invalid response format from provider" }, { status: 400 });
      }
    }

    if (action === "create") {
      const parsed = createSchema.parse(body);
      const provider = await prisma.apiProvider.create({ data: parsed });
      return NextResponse.json({ provider }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    console.error("[API PROVIDERS POST]", err.response?.data || err.message);
    return NextResponse.json({ error: "Internal server error or provider unreachable" }, { status: 500 });
  }
}
