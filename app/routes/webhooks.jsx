import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin && topic !== "SHOP_REDACT") {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  // Handle mandatory privacy webhooks
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "CUSTOMERS_DATA_REQUEST":
      // Shopify requires you to respond to this if you store customer data.
      // Payload contains { shop_id, shop_domain, customer: { id, email } }
      break;
    case "CUSTOMERS_REDACT":
      // Payload contains { shop_id, shop_domain, customer: { id, email } }
      if (payload?.customer?.email) {
        await db.subscriber.deleteMany({
          where: { shop, email: payload.customer.email },
        });
      }
      break;
    case "SHOP_REDACT":
      // Payload contains { shop_id, shop_domain }
      // Delete all data for this shop
      await db.subscriber.deleteMany({ where: { shop } });
      await db.shopSettings.deleteMany({ where: { shop } });
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
