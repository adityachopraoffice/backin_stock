import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  InlineGrid,
  Button,
  DataTable,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { TitleBar } from "@shopify/app-bridge-react";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const totalSubscribers = await prisma.subscriber.count({ where: { shop: session.shop } });
  const recentSubscribers = await prisma.subscriber.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const settings = await prisma.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  return json({
    totalSubscribers,
    recentSubscribers,
    settings: settings || { currentPlan: "free", selectedTemplate: "minimal" },
  });
}

export default function Dashboard() {
  const { totalSubscribers, recentSubscribers, settings } = useLoaderData();
  const navigate = useNavigate();

  const subscriberRows = recentSubscribers.map((sub) => [
    sub.email,
    sub.productTitle,
    new Date(sub.createdAt).toLocaleDateString(),
  ]);

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              <Card>
                <BlockStack gap="200">
                  <div className="stat-icon-container stat-icon-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <Text as="h3" variant="headingSm" color="subdued">
                    Total Subscribers
                  </Text>
                  <Text as="p" variant="headingLg">
                    {totalSubscribers}
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <div className="stat-icon-container stat-icon-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <Text as="h3" variant="headingSm" color="subdued">
                    Current Plan
                  </Text>
                  <Text as="p" variant="headingLg">
                    {settings.currentPlan.charAt(0).toUpperCase() + settings.currentPlan.slice(1)}
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <div className="stat-icon-container stat-icon-purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                  </div>
                  <Text as="h3" variant="headingSm" color="subdued">
                    Active Template
                  </Text>
                  <Text as="p" variant="headingLg">
                    {settings.selectedTemplate.charAt(0).toUpperCase() + settings.selectedTemplate.slice(1)}
                  </Text>
                </BlockStack>
              </Card>
            </InlineGrid>

            <Card padding="0">
              <BlockStack gap="400">
                <div style={{ padding: "16px 16px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text variant="headingMd" as="h2">
                    Recent Subscribers
                  </Text>
                  <Button onClick={() => navigate("/app/subscribers")}>View all</Button>
                </div>
                {recentSubscribers.length === 0 ? (
                  <div style={{ padding: "16px" }}>
                    <EmptyState
                      heading="No subscribers yet"
                      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                      <p>When customers sign up for back in stock notifications, they will appear here.</p>
                    </EmptyState>
                  </div>
                ) : (
                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["Email", "Product", "Date"]}
                    rows={subscriberRows}
                  />
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
