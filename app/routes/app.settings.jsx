import { json } from "@remix-run/node";
import {
  useLoaderData,
  useSubmit,
  useActionData,
  useNavigation,
  useNavigate,
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

function PreviewWidget({ title, buttonText, template }) {
  let containerStyle = {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontFamily: "sans-serif",
    transition: "all 0.3s ease",
  };

  let inputStyle = {
    padding: "10px",
    width: "100%",
    boxSizing: "border-box",
  };

  let btnStyle = {
    padding: "12px 16px",
    cursor: "pointer",
    width: "100%",
  };

  let titleStyle = {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "600",
  };

  if (template === "minimal") {
    containerStyle = { ...containerStyle, border: "1px solid #e1e3e5", borderRadius: "4px", backgroundColor: "#fff" };
    inputStyle = { ...inputStyle, border: "1px solid #c9cccf", borderRadius: "4px" };
    btnStyle = { ...btnStyle, border: "none", backgroundColor: "#202223", color: "#fff", borderRadius: "4px" };
  } else if (template === "bold") {
    containerStyle = { ...containerStyle, border: "4px solid #000", backgroundColor: "#fff" };
    inputStyle = { ...inputStyle, border: "2px solid #000", fontWeight: "bold", fontSize: "16px" };
    btnStyle = { ...btnStyle, border: "2px solid #000", backgroundColor: "#000", color: "#fff", fontWeight: "bold", textTransform: "uppercase", fontSize: "16px" };
    titleStyle = { ...titleStyle, textTransform: "uppercase", fontWeight: "900" };
  } else if (template === "elegant") {
    containerStyle = { ...containerStyle, borderRadius: "12px", backgroundColor: "#fdfbf7", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" };
    inputStyle = { ...inputStyle, border: "1px solid #e0dcd3", borderRadius: "24px", backgroundColor: "#fff", padding: "12px 16px" };
    btnStyle = { ...btnStyle, border: "none", backgroundColor: "#6b5b52", color: "#fff", borderRadius: "24px", fontSize: "16px" };
    titleStyle = { ...titleStyle, fontFamily: "serif", fontStyle: "italic", color: "#4a3f39", fontSize: "20px", textAlign: "center" };
  } else if (template === "dark") {
    containerStyle = { ...containerStyle, border: "1px solid #444", borderRadius: "8px", backgroundColor: "#111213", color: "#fff" };
    inputStyle = { ...inputStyle, border: "1px solid #555", borderRadius: "4px", backgroundColor: "#202123", color: "#fff" };
    btnStyle = { ...btnStyle, border: "none", backgroundColor: "#fff", color: "#111213", borderRadius: "4px", fontWeight: "bold" };
    titleStyle = { ...titleStyle, color: "#fff" };
  }

  return (
    <div style={containerStyle}>
      <h4 style={titleStyle}>{title || "Notify me when back in stock"}</h4>
      <input style={inputStyle} type="email" placeholder="Email address" disabled />
      <button style={btnStyle} disabled>{buttonText || "Notify Me"}</button>
    </div>
  );
}

export default function Settings() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const nav = useNavigation();
  const navigate = useNavigate();

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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        if (tpl.requiresUpgrade) {
                          navigate("/app/billing");
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

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Live Preview</Text>
            <Card background="bg-surface-secondary">
              <PreviewWidget 
                title={formState.formTitle} 
                buttonText={formState.buttonText} 
                template={formState.selectedTemplate} 
              />
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
