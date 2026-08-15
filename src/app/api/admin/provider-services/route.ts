import { NextResponse } from "next/server";
import { getProviderServices } from "@/lib/providers/boostlegit";

export async function GET() {
  try {
    const services = await getProviderServices();
    return NextResponse.json({ success: true, services });
  } catch (err: any) {
    console.error("[PROVIDER-SERVICES-GET]", err);
    return NextResponse.json({ error: err.message || "Failed to fetch services" }, { status: 500 });
  }
}
