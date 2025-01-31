import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const StripeService = {
  async createPaymentIntent({ amount, currency, customerEmail }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount should be in the smallest currency unit (e.g., cents for USD)
        currency,
        receipt_email: customerEmail,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: paymentIntent.id,
        originalAmount: paymentIntent.amount,
        originalCurrency: paymentIntent.currency,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error("Failed to create payment intent");
    }
  },

  async handleWebhook(rawBody, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET // Your webhook secret key from Stripe Dashboard
      );

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        return {
          success: true,
          paymentId: paymentIntent.id,
        };
      }

      return { success: false };
    } catch (error) {
      console.error("Error verifying webhook:", error);
      throw new Error("Webhook verification failed");
    }
  },
};
