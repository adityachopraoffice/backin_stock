import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ success: false, message: "Method not allowed" }, { status: 405, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const body = await request.json();
  const { shop, email, productTitle, productHandle } = body;

  if (!shop || !email || !productHandle) {
    return json({ success: false, message: "Missing required fields" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  let settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  const currentPlan = settings ? settings.currentPlan : "free";

  const subscriberCount = await prisma.subscriber.count({
    where: { shop },
  });

  let cap = 50;
  if (currentPlan === "basic") cap = 500;
  else if (currentPlan === "pro") cap = Infinity;

  if (subscriberCount >= cap) {
    return json({ success: false, message: "Notifications unavailable" }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const existing = await prisma.subscriber.findFirst({
    where: {
      shop,
      email,
      productHandle,
    },
  });

  if (existing) {
    return json({ success: false, message: "Already subscribed" }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  await prisma.subscriber.create({
    data: {
      shop,
      email,
      productTitle: productTitle || "Unknown Product",
      productHandle,
    },
  });

  return json({ success: true }, { headers: { "Access-Control-Allow-Origin": "*" } });
}

export const options = () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
