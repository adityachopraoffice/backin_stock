import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  Badge,
  BlockStack,
  InlineGrid,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { TitleBar } from "@shopify/app-bridge-react";

export async function loader({ request }) {
  const { session, billing } = await authenticate.admin(request);

  // Sync plan from Shopify Billing API
  const { appSubscriptions } = await billing.check({
    plans: ["basic", "pro"],
    isTest: true,
  });

  let activePlan = "free";
  if (appSubscriptions.some((sub) => sub.name === "pro")) {
    activePlan = "pro";
  } else if (appSubscriptions.some((sub) => sub.name === "basic")) {
    activePlan = "basic";
  }

  let settings = await prisma.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: { shop: session.shop, currentPlan: activePlan },
    });
  } else if (settings.currentPlan !== activePlan) {
    settings = await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: { currentPlan: activePlan },
    });
  }

  return json({ currentPlan: settings.currentPlan });
}

export async function action({ request }) {
  const { billing, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan");

  if (plan === "basic" || plan === "pro") {
    const shopName = session.shop.split(".")[0];
    const apiKey = process.env.SHOPIFY_API_KEY;
    await billing.request({
      plan: plan,
      isTest: true,
      returnUrl: `https://admin.shopify.com/store/${shopName}/apps/${apiKey}/app/billing`,
    });
  } else if (plan === "free") {
    const { appSubscriptions } = await billing.check({
      plans: ["basic", "pro"],
      isTest: true,
    });
    
    for (const sub of appSubscriptions) {
      if (sub.id) {
        await billing.cancel({
          subscriptionId: sub.id,
          isTest: true,
          prorate: true,
        });
      }
    }
  }

  return json({ success: true });
}

export default function Billing() {
  const { currentPlan } = useLoaderData();
  const submit = useSubmit();

  const handleUpgrade = (plan) => {
    submit({ plan }, { method: "post" });
  };

  return (
    <Page>
      <TitleBar title="Billing" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <div>
              <Text variant="headingLg" as="h1">
                Current Plan: <Badge tone="success">{currentPlan.toUpperCase()}</Badge>
              </Text>
            </div>

            <InlineGrid columns={3} gap="400">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">Free — $0/mo</Text>
                  <ul>
                    <li>50 subscribers</li>
                    <li>1 template (Minimal)</li>
                    <li>No CSV export</li>
                  </ul>
                  <Button 
                    disabled={currentPlan === "free"}
                    onClick={() => handleUpgrade("free")}
                  >
                    {currentPlan === "free" ? "Current Plan" : "Downgrade to Free"}
                  </Button>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">Basic — $4.99/mo</Text>
                  <ul>
                    <li>500 subscribers</li>
                    <li>All 4 templates</li>
                    <li>No CSV export</li>
                  </ul>
                  <Button
                    primary={currentPlan !== "basic"}
                    disabled={currentPlan === "basic"}
                    onClick={() => handleUpgrade("basic")}
                  >
                    {currentPlan === "basic" ? "Current Plan" : "Upgrade to Basic"}
                  </Button>
                </BlockStack>
              </Card>

              <div className="pro-plan-card" style={{ padding: "16px" }}>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="h2">Pro — $9.99/mo</Text>
                    <Badge tone="success">Recommended</Badge>
                  </InlineStack>
                  <ul>
                    <li>Unlimited subscribers</li>
                    <li>All 4 templates</li>
                    <li>CSV export</li>
                  </ul>
                  <Button
                    primary={currentPlan !== "pro"}
                    disabled={currentPlan === "pro"}
                    onClick={() => handleUpgrade("pro")}
                  >
                    {currentPlan === "pro" ? "Current Plan" : "Upgrade to Pro"}
                  </Button>
                </BlockStack>
              </div>
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
