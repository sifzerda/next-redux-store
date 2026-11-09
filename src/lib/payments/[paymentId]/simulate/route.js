// src/app/api/payments/[paymentId]/simulate/route.js

import { prisma } from "@/lib/prisma";
import { confirmPayment } from "@/lib/payments/confirmPayment";

export async function POST(request, { params }) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json(
      { error: "Not available" },
      { status: 404 }
    );
  }

  // Restrict this local demo endpoint to the local host.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || new URL(origin).host !== host) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { paymentId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment || payment.provider !== "BANK_TRANSFER") {
    return Response.json(
      { error: "Bank transfer not found" },
      { status: 404 }
    );
  }

  try {
    const result = await confirmPayment(paymentId, true);

    return Response.json({
      paymentId: result.id,
      status: result.status,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 409 }
    );
  }
}

import { prisma } from "@/lib/prisma";
import { confirmPayment } from "@/lib/payments/confirmPayment";

export async function POST(request, { params }) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json(
      { error: "Not available" },
      { status: 404 }
    );
  }

  // Restrict this local demo endpoint to the local host.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || new URL(origin).host !== host) {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { paymentId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment || payment.provider !== "BANK_TRANSFER") {
    return Response.json(
      { error: "Bank transfer not found" },
      { status: 404 }
    );
  }

  try {
    const result = await confirmPayment(paymentId, true);

    return Response.json({
      paymentId: result.id,
      status: result.status,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 409 }
    );
  }
}
