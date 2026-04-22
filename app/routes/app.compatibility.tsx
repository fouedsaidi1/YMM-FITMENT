@'
// app/routes/app.compatibility.tsx
import { useState } from "react";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Page, Layout, Card, Text, BlockStack, InlineGrid,
  Select, Button, DataTable, Modal, TextField,
  Banner, Spinner, Box, InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const year = url.searchParams.get("year") || "";
  const make = url.searchParams.get("make") || "";
  const model = url.searchParams.get("model") || "";

  const years = await prisma.vehicleYear.findMany({ orderBy: { year: "desc" } });

  const makes = year
    ? await prisma.vehicleMake.findMany({
        where: { year: { year: parseInt(year) } },
        orderBy: { name: "asc" },
      })
    : [];

  const models = make && year
    ? await prisma.vehicleModel.findMany({
        where: { make: { name: make, year: { year: parseInt(year) } } },
        orderBy: { name: "asc" },
      })
    : [];

  const compatibilities = model
    ? await prisma.productCompatibility.findMany({
        where: { model: { name: model, make: { name: make, year: { year: parseInt(year) } } } },
        include: { model: { include: { make: { include: { year: true } } } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return json({ years, makes, models, compatibilities, filters: { year, make, model } });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "add") {
    const modelId = parseInt(form.get("modelId") as string);
    const shopifyProductId = form.get("shopifyProductId") as string;
    const productTitle = form.get("productTitle") as string;
    const notes = form.get("notes") as string;

    await prisma.productCompatibility.upsert({
      where: { shopifyProductId_modelId: { shopifyProductId, modelId } },
      update: { productTitle, notes },
      create: { shopifyProductId, productTitle, modelId, notes },
    });
    return json({ success: true });
  }

  if (intent === "delete") {
    const id = parseInt(form.get("id") as string);
    await prisma.productCompatibility.delete({ where: { id } });
    return json({ success: true });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
};

export default function Compatibility() {
  const { years, makes, models, compatibilities, filters } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const nav = useNavigation();
  const shopify = useAppBridge();
  const loading = nav.state !== "idle";

  const [modalOpen, setModalOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");

  const yearOptions = [{ label: "Select year", value: "" }, ...years.map(y => ({ label: String(y.year), value: String(y.year) }))];
  const makeOptions = [{ label: "Select make", value: "" }, ...makes.map(m => ({ label: m.name, value: m.name }))];
  const modelOptions = [{ label: "Select model", value: "" }, ...models.map(m => ({ label: m.name, value: String(m.id) }))];

  const handleFilterChange = (key: string, value: string) => {
    const params: Record<string, string> = { ...filters };
    params[key] = value;
    if (key === "year") { params.make = ""; params.model = ""; }
    if (key === "make") { params.model = ""; }
    submit(params, { method: "get" });
  };

  const handlePickProduct = async () => {
    const selected = await shopify.resourcePicker({ type: "product", multiple: false });
    if (selected && selected.length > 0) {
      setProductId(selected[0].id);
      setProductTitle(selected[0].title);
    }
  };

  const handleAdd = () => {
    if (!productId || !productTitle || !selectedModelId) return;
    const formData = new FormData();
    formData.append("intent", "add");
    formData.append("modelId", selectedModelId);
    formData.append("shopifyProductId", productId);
    formData.append("productTitle", productTitle);
    formData.append("notes", notes);
    submit(formData, { method: "post" });
    setModalOpen(false);
    setProductId(""); setProductTitle(""); setNotes("");
  };

  const handleDelete = (id: number) => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", String(id));
    submit(formData, { method: "post" });
  };

  const openModal = () => {
    setSelectedModelId(models.find(m => m.name === filters.model)?.id.toString() || "");
    setProductId(""); setProductTitle(""); setNotes("");
    setModalOpen(true);
  };

  const rows = compatibilities.map((c) => [
    c.productTitle,
    `${c.model.make.year.year} ${c.model.make.name} ${c.model.name}`,
    c.notes || "—",
    <Button tone="critical" size="micro" onClick={() => handleDelete(c.id)}>Remove</Button>,
  ]);

  return (
    <Page
      title="Compatibility Manager"
      primaryAction={filters.model ? { content: "Add Compatibility Rule", onAction: openModal } : undefined}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Filter by Vehicle</Text>
              <InlineGrid columns={3} gap="300">
                <Select label="Year" options={yearOptions} value={filters.year} onChange={(v) => handleFilterChange("year", v)} />
                <Select label="Make" options={makeOptions} value={filters.make} onChange={(v) => handleFilterChange("make", v)} disabled={!filters.year} />
                <Select
                  label="Model"
                  options={modelOptions}
                  value={filters.model ? String(models.find(m => m.name === filters.model)?.id || "") : ""}
                  onChange={(v) => {
                    const name = models.find(m => m.id === parseInt(v))?.name || "";
                    handleFilterChange("model", name);
                  }}
                  disabled={!filters.make}
                />
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  {filters.model
                    ? `Parts compatible with ${filters.year} ${filters.make} ${filters.model}`
                    : "Select a vehicle above to see compatible parts"}
                </Text>
                {loading && <Spinner size="small" />}
              </InlineStack>
              {compatibilities.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text"]}
                  headings={["Product", "Vehicle", "Notes", "Action"]}
                  rows={rows}
                />
              ) : filters.model ? (
                <Box padding="400">
                  <Banner tone="warning">
                    <p>No compatible parts found for this vehicle. Click "Add Compatibility Rule" to add one.</p>
                  </Banner>
                </Box>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add part compatible with ${filters.year} ${filters.make} ${filters.model}`}
        primaryAction={{ content: "Add Rule", onAction: handleAdd, disabled: !productId || !productTitle }}
        secondaryActions={[{ content: "Cancel", onAction: () => setModalOpen(false) }]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <InlineStack gap="300" align="start">
              <Button onClick={handlePickProduct}>
                {productId ? "Change Product" : "Select Product from Store"}
              </Button>
            </InlineStack>
            {productTitle && (
              <Banner tone="success">
                <p>Selected: <strong>{productTitle}</strong></p>
              </Banner>
            )}
            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={setNotes}
              placeholder="e.g. Fits 4WD only"
              multiline={2}
              autoComplete="off"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
'@ | Set-Content app/routes/app.compatibility.tsx -Encoding UTF8
