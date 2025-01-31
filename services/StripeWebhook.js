import { StripeService } from "./StripeService";

// Webhook handler
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      const result = await StripeService.handleWebhook(req.rawBody, sig);
      if (result.success) {
        // Update order status
        await Order.update(
          { status: 'completed' },
          { where: { 'stripeData.paymentId': result.paymentId } }
        );
      }
      res.status(200).end();
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  };