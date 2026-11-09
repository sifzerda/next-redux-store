// src/lib/payments/capturePayPal.js

import { prisma } from "@/lib/prisma";
import { paypalRequest } from "./paypalClient";

export async function capturePayPalPayment(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment || payment.provider !== "PAYPAL") {
    throw new Error("PayPal payment not found");
  }

  if (payment.status === "SUCCEEDED") {
    return payment;
  }

  if (
    payment.status !== "PROCESSING" ||
    payment.order.status !== "PENDING"
  ) {
    throw new Error("Payment cannot be captured");
  }

  const result = await paypalRequest(
    `/v2/checkout/orders/${payment.providerPaymentId}/capture`,
    {
      method: "POST",
      requestId: `capture-${payment.id}`,
    }
  );

  const capture =
    result.purchase_units?.[0]?.payments?.captures?.[0];

  if (
    result.status !== "COMPLETED" ||
    capture?.status !== "COMPLETED" ||
    capture.amount?.currency_code !==
      payment.currency.toUpperCase() ||
    capture.amount?.value !==
      (payment.amount / 100).toFixed(2)
  ) {
    throw new Error("PayPal capture not confirmed");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCEEDED" },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    return updated;
  });
}
