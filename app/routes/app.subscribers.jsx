import { json } from "@remix-run/node";
import {
  useLoaderData,
  useFetcher,
  useNavigate,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Badge,
  EmptyState,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { TitleBar } from "@shopify/app-bridge-react";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);

  if (url.searchParams.get("fetch_all") === "true") {
    const allSubs = await prisma.subscriber.findMany({
      where: { shop: session.shop },
      orderBy: { createdAt: "desc" },
    });
    return json({ subscribers: allSubs });
  }

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  const [subscribers, totalCount, settings] = await Promise.all([
    prisma.subscriber.findMany({
      where: { shop: session.shop },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.subscriber.count({
      where: { shop: session.shop },
    }),
    prisma.shopSettings.findUnique({
      where: { shop: session.shop },
    }),
  ]);

  const currentPlan = settings?.currentPlan || "free";
  let cap = 50;
  if (currentPlan === "basic") cap = 500;
  else if (currentPlan === "pro") cap = Infinity;
  const capLabel = cap === Infinity ? "Unlimited" : cap;

  return json({
    subscribers,
    totalCount,
    page,
    currentPlan,
    capLabel,
  });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const id = formData.get("id");
  if (id) {
    await prisma.subscriber.deleteMany({
      where: { id: parseInt(id, 10), shop: session.shop },
    });
  }
  return json({ success: true });
}

export default function Subscribers() {
  const { subscribers, totalCount, page, currentPlan, capLabel } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleDelete = (id) => {
    fetcher.submit({ id }, { method: "post" });
  };

  const handleExportCSV = async () => {
    const response = await fetch("?fetch_all=true");
    const data = await response.json();
    const subs = data.subscribers;

    if (!subs || subs.length === 0) return;

    const headers = ["Email", "Product", "Date"];
    const rows = subs.map((sub) => [
      sub.email,
      sub.productTitle,
      new Date(sub.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasPrevious = page > 1;
  const hasNext = page * 10 < totalCount;

  const rows = subscribers.map((sub) => [
    sub.email,
    sub.productTitle,
    new Date(sub.createdAt).toLocaleDateString(),
    <Button tone="critical" onClick={() => handleDelete(sub.id)}>Delete</Button>,
  ]);

  return (
    <Page>
      <TitleBar title="Subscribers" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <InlineStack align="space-between" blockAlign="center">
              <Badge tone="info">
                {totalCount} / {capLabel} subscribers
              </Badge>
              {currentPlan === "pro" && (
                <Button onClick={handleExportCSV}>Export CSV</Button>
              )}
            </InlineStack>

            <Card padding="0">
              {subscribers.length === 0 ? (
                <EmptyState
                  heading="No subscribers yet"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>When customers sign up for back in stock notifications, they will appear here.</p>
                </EmptyState>
              ) : (
                <BlockStack gap="400">
                  <DataTable
                    columnContentTypes={["text", "text", "text", "text"]}
                    headings={["Email", "Product", "Date", ""]}
                    rows={rows}
                  />
                  <div style={{ padding: "16px", display: "flex", justifyContent: "center", gap: "16px" }}>
                    <Button disabled={!hasPrevious} onClick={() => navigate(`?page=${page - 1}`)}>
                      Previous
                    </Button>
                    <Button disabled={!hasNext} onClick={() => navigate(`?page=${page + 1}`)}>
                      Next
                    </Button>
                  </div>
                </BlockStack>
              )}
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
