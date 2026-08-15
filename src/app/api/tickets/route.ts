import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  subject:  z.string().min(5),
  message:  z.string().min(20),
  priority: z.enum(["LOW","MEDIUM","HIGH"]).default("MEDIUM"),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tickets = await prisma.ticket.findMany({
    where:   { userId: session.user.id },
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.parse(body);

    const ticket = await prisma.ticket.create({
      data: {
        userId:   session.user.id,
        subject:  parsed.subject,
        priority: parsed.priority,
        messages: {
          create: {
            senderId: session.user.id,
            isAdmin:  false,
            message:  parsed.message,
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
