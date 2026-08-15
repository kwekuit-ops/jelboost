import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found or no password set (OAuth user)" }, { status: 400 });
    }

    const valid = await bcrypt.compare(parsed.currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(parsed.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data:  { password: hashed },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
