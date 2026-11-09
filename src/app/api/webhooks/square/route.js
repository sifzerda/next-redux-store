// src/app/api/webhooks/square/route.js

import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function verifySignature(body, signature) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_URL;

  if (!key || !url || !signature) return false;

  const expected = createHmac("sha256", key)
    .update(url + body)
    .digest();

  const received = Buffer.from(signature, "base64");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

export async function POST(request) {
  const body = await request.text();

  const signature = request.headers.get(
    "x-square-hmacsha256-signature"
  );

  if (!verifySignature(body, signature)) {
    return Response.json(
      { error: "Invalid signature" },
      { status: 403 }
    );
  }

  let event;

  try {
    event = JSON.parse(body);
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (event.type !== "payment.updated") {
    return Response.json({ received: true });
  }

  const squarePayment = event.data?.object?.payment;

  if (!squarePayment?.order_id) {
    return Response.json({ received: true });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          provider: "SQUARE",
          providerOrderId: squarePayment.order_id,
        },
        include: { order: true },
      });

      if (!payment) {
        throw new Error("Square order not found");
      }

      if (
        squarePayment.amount_money?.amount !== payment.amount ||
        squarePayment.amount_money?.currency !==
          payment.currency.toUpperCase() ||
        squarePayment.location_id !==
          process.env.SQUARE_LOCATION_ID
      ) {
        throw new Error("Square payment details mismatch");
      }

      if (squarePayment.status !== "COMPLETED") {
        return;
      }

      if (payment.status === "SUCCEEDED") {
        return;
      }

      if (
        !["PENDING", "PROCESSING"].includes(payment.status) ||
        payment.order.status !== "PENDING"
      ) {
        return;
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          providerPaymentId: squarePayment.id,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });
    });

    return Response.json({ received: true });
  } catch (error) {
    console.error("Square webhook error:", error);

    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
