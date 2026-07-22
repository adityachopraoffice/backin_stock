import { json } from "@remix-run/node";
import {
  useLoaderData,
  useSubmit,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  TextField,
  Button,
  InlineGrid,
  Text,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useEffect, useState } from "react";
import { TitleBar } from "@shopify/app-bridge-react";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  let settings = await prisma.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: {
        shop: session.shop,
      },
    });
  }

  return json({ settings });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const formTitle = formData.get("formTitle");
  const buttonText = formData.get("buttonText");
  const successMessage = formData.get("successMessage");
  const selectedTemplate = formData.get("selectedTemplate");

  await prisma.shopSettings.update({
    where: { shop: session.shop },
    data: {
      formTitle: String(formTitle),
      buttonText: String(buttonText),
      successMessage: String(successMessage),
      selectedTemplate: String(selectedTemplate),
    },
  });

  return json({ success: true });
}

export default function Settings() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const nav = useNavigation();

  const isSaving = nav.state === "submitting";

  const [formState, setFormState] = useState({
    formTitle: settings.formTitle,
    buttonText: settings.buttonText,
    successMessage: settings.successMessage,
    selectedTemplate: settings.selectedTemplate,
  });

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Settings saved");
    }
  }, [actionData]);

  const handleChange = (value, id) => {
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const templates = [
    { id: "minimal", name: "Minimal", requiresUpgrade: false },
    { id: "bold", name: "Bold", requiresUpgrade: settings.currentPlan === "free" },
    { id: "elegant", name: "Elegant", requiresUpgrade: settings.currentPlan === "free" },
    { id: "dark", name: "Dark", requiresUpgrade: settings.currentPlan === "free" },
  ];

  const handleSave = () => {
    submit(formState, { method: "post" });
  };

  return (
    <Page>
      <TitleBar title="BackInStock Settings" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Form Details
                </Text>
                <TextField
                  label="Form Title"
                  value={formState.formTitle}
                  onChange={(v) => handleChange(v, "formTitle")}
                  autoComplete="off"
                />
                <TextField
                  label="Button Text"
                  value={formState.buttonText}
                  onChange={(v) => handleChange(v, "buttonText")}
                  autoComplete="off"
                />
                <TextField
                  label="Success Message"
                  value={formState.successMessage}
                  onChange={(v) => handleChange(v, "successMessage")}
                  autoComplete="off"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Template
                </Text>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        if (tpl.requiresUpgrade) {
                          window.location.href = "/app/billing";
                        } else {
                          handleChange(tpl.id, "selectedTemplate");
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        border: formState.selectedTemplate === tpl.id ? "2px solid #005bd3" : "1px solid #c9cccf",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: formState.selectedTemplate === tpl.id ? "#f4f6f8" : "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Text variant="headingSm" as="h3">
                        {tpl.name}
                      </Text>
                      {tpl.requiresUpgrade && (
                        <Badge tone="warning">Upgrade to Basic</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </BlockStack>
            </Card>

            <Button primary loading={isSaving} onClick={handleSave}>
              Save Settings
            </Button>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
