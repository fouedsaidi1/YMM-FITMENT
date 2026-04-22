// app/routes/app.assign-by-vehicle.tsx
import { useState } from "react";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Page, Layout, Card, Text, BlockStack, InlineGrid,
  Select, Button, DataTable, Banner, Spinner,
  InlineStack, Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const make = url.searchParams.get("make") || "";
  const model = url.searchParams.get("model") || "";
  const yearFrom = url.searchParams.get("yearFrom") || "";
  const yearTo = url.searchParams.get("yearTo") || "";

  const allMakes = await prisma.vehicleMake.findMany({ distinct: ["name"], orderBy: { name: "asc" } });
  const models = make
    ? await prisma.vehicleModel.findMany({ where: { make: { name: make } }, distinct: ["name"], orderBy: { name: "asc" } })
    : [];
  const years = await prisma.vehicleYear.findMany({ orderBy: { year: "desc" } });
  const vehicles =
    make && model && yearFrom && yearTo
      ? await prisma.vehicleModel.findMany({
          where: {
            name: model,
            make: { name: make, year: { year: { gte: parseInt(yearFrom), lte: parseInt(yearTo) } } },
          },
          include: { make: { include: { year: true } } },
          orderBy: { make: { year: { year: "asc" } } },
        })
      : [];

  return json({ allMakes, models, years, vehicles, filters: { make, model, yearFrom, yearTo } });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const form = await request.formData();
  const modelIds = JSON.parse(form.get("modelIds") as string) as number[];
  const products = JSON.parse(form.get("products") as string) as { id: string; title: string }[];
  const notes = (form.get("notes") as string) || "";

  let created = 0;
  for (const modelId of modelIds) {
    for (const product of products) {
      await prisma.productCompatibility.upsert({
        where: { shopifyProductId_modelId: { shopifyProductId: product.id, modelId } },
        update: { productTitle: product.title, notes },
        create: { shopifyProductId: product.id, productTitle: product.title, modelId, notes },
      });
      created++;
    }
  }
  return json({ success: true, created });
};

export default function AssignByVehicle() {
  const { allMakes, models, years, vehicles, filters } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const nav = useNavigation();
  const shopify = useAppBridge();
  const loading = nav.state !== "idle";

  const [selectedProducts, setSelectedProducts] = useState<{ id: string; title: string }[]>([]);
  const [result, setResult] = useState<{ created: number } | null>(null);

  const makeOptions = [{ label: "Select make", value: "" }, ...allMakes.map(m => ({ label: m.name, value: m.name }))];
  const modelOptions = [{ label: "Select model", value: "" }, ...models.map(m => ({ label: m.name, value: m.name }))];
  const yearOptions = [{ label: "Select year", value: "" }, ...years.map(y => ({ label: String(y.year), value: String(y.year) }))];

  const handleFilterChange = (key: string, value: string) => {
    const params: Record<string, string> = { ...filters };
    params[key] = value;
    if (key === "make") { params.model = ""; params.yearFrom = ""; params.yearTo = ""; }
    submit(params, { method: "get" });
  };

  const handlePickProducts = async () => {
    const selected = await shopify.resourcePicker({ type: "product", multiple: true });
    if (selected && selected.length > 0) {
      setSelectedProducts(selected.map((p: any) => ({ id: p.id, title: p.title })));
    }
  };

  const handleAssign = () => {
    if (!selectedProducts.length || !vehicles.length) return;
    const formData = new FormData();
    formData.append("modelIds", JSON.stringify(vehicles.map(v => v.id)));
    formData.append("products", JSON.stringify(selectedProducts));
    submit(formData, { method: "post" });
    setResult({ created: vehicles.length * selectedProducts.length });
    setSelectedProducts([]);
  };

  const vehicleRows = vehicles.map(v => [
    String(v.make.year.year),
    v.make.name,
    v.name,
  ]);

  return (
    <Page title="Assign by Vehicle" backAction={{ content: "Dashboard", url: "/app" }}>
      <Layout>
        {result && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => setResult(null)}>
              <p>Created <strong>{result.created}</strong> compatibility rules.</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Step 1 — Select Vehicle Range</Text>
              <InlineGrid columns={4} gap="300">
                <Select label="Make" options={makeOptions} value={filters.make} onChange={v => handleFilterChange("make", v)} />
                <Select label="Model" options={modelOptions} value={filters.model} onChange={v => handleFilterChange("model", v)} disabled={!filters.make} />
                <Select label="Year From" options={yearOptions} value={filters.yearFrom} onChange={v => handleFilterChange("yearFrom", v)} disabled={!filters.model} />
                <Select label="Year To" options={yearOptions} value={filters.yearTo} onChange={v => handleFilterChange("yearTo", v)} disabled={!filters.yearFrom} />
              </InlineGrid>
              {loading && <Spinner size="small" />}
              {vehicles.length > 0 && (
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">{vehicles.length} vehicles matched — all will be assigned:</Text>
                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["Year", "Make", "Model"]}
                    rows={vehicleRows}
                  />
                </BlockStack>
              )}
              {filters.model && filters.yearFrom && filters.yearTo && vehicles.length === 0 && !loading && (
                <Banner tone="warning"><p>No vehicles found for this combination.</p></Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Step 2 — Select Products</Text>
              <Button onClick={handlePickProducts}>
                {selectedProducts.length > 0 ? `${selectedProducts.length} product(s) selected — Change` : "Pick Products from Store"}
              </Button>
              {selectedProducts.length > 0 && (
                <BlockStack gap="200">
                  {selectedProducts.map(p => <Badge key={p.id} tone="success">{p.title}</Badge>)}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Step 3 — Assign</Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {vehicles.length} vehicle(s) × {selectedProducts.length} product(s) = <strong>{vehicles.length * selectedProducts.length} rules</strong> will be created.
              </Text>
              <Button
                variant="primary"
                onClick={handleAssign}
                disabled={!selectedProducts.length || !vehicles.length || loading}
                loading={loading}
              >
                Assign Compatibility Rules
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
