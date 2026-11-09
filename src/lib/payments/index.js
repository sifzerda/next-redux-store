// src/lib/payments/index.js

import { stripeGateway } from "./stripe";
import { bankTransferGateway } from "./bankTransfer";
import { stripeGateway } from "./stripe";
import { paypalGateway } from "./paypal";
import { squareGateway } from "./square";
import { bankTransferGateway } from "./bankTransfer";

const unavailable = (name) => ({
  async createPayment() {
    throw new Error(`${name} integration is not configured`);
  },

  async getPaymentStatus() {
    throw new Error(`${name} integration is not configured`);
  },
});

const gateways = {
  STRIPE: stripeGateway,
  PAYPAL: paypalGateway,
  SQUARE: squareGateway,
  BANK_TRANSFER: bankTransferGateway,
};

export function getPaymentGateway(provider) {
  const gateway = gateways[provider];

  if (!gateway) {
    throw new Error(
      `Unsupported payment provider: ${provider}`
    );
  }

  return gateway;
}
