import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }

  let settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = {
      selectedTemplate: "minimal",
      formTitle: "Notify me when back in stock",
      buttonText: "Notify Me",
      successMessage: "You'll be notified when this is back!",
      currentPlan: "free",
    };
  }

  const subscriberCount = await prisma.subscriber.count({
    where: { shop },
  });

  return json(
    {
      selectedTemplate: settings.selectedTemplate,
      formTitle: settings.formTitle,
      buttonText: settings.buttonText,
      successMessage: settings.successMessage,
      currentPlan: settings.currentPlan,
      subscriberCount,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

export const options = () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
