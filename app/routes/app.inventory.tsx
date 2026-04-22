// app/routes/app.inventory.tsx
import { useLoaderData, useSubmit } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Page, Layout, Card, Text, BlockStack, Select,
  DataTable, Badge, InlineGrid, Box, Banner, Spinner, InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const year = url.searchParams.get("year") || "";
  const make = url.searchParams.get("make") || "";
  const model = url.searchParams.get("model") || "";

  const years = await prisma.vehicleYear.findMany({ orderBy: { year: "desc" } });
  const makes = year
    ? await prisma.vehicleMake.findMany({ where: { year: { year: parseInt(year) } }, orderBy: { name: "asc" } })
    : [];
  const models = make && year
    ? await prisma.vehicleModel.findMany({ where: { make: { name: make, year: { year: parseInt(year) } } }, orderBy: { name: "asc" } })
    : [];

  let inventoryData: any[] = [];

  if (model && make && year) {
    const compatibilities = await prisma.productCompatibility.findMany({
      where: { model: { name: model, make: { name: make, year: { year: parseInt(year) } } } },
    });

    if (compatibilities.length > 0) {
      const productIds = compatibilities.map(c => c.shopifyProductId);
      // Fetch inventory from Shopify Admin API
      const query = `
        query getProductInventory($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              status
              totalInventory
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    inventoryQuantity
                    price
                    sku
                  }
                }
              }
            }
          }
        }
      `;
      try {
        const response = await admin.graphql(query, { variables: { ids: productIds } });
        const data = await response.json();
        inventoryData = (data.data?.nodes || []).filter(Boolean);
      } catch (e) {
        inventoryData = compatibilities.map(c => ({
          id: c.shopifyProductId,
          title: c.productTitle,
          status: "UNKNOWN",
          totalInventory: null,
          variants: { edges: [] },
        }));
      }
    }
  }

  return json({ years, makes, models, inventoryData, filters: { year, make, model } });
};

export default function Inventory() {
  const { years, makes, models, inventoryData, filters } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const yearOptions = [{ label: "Select year", value: "" }, ...years.map(y => ({ label: String(y.year), value: String(y.year) }))];
  const makeOptions = [{ label: "Select make", value: "" }, ...makes.map(m => ({ label: m.name, value: m.name }))];
  const modelOptions = [{ label: "Select model", value: "" }, ...models.map(m => ({ label: m.name, value: m.name }))];

  const handleFilterChange = (key: string, value: string) => {
    const params: Record<string, string> = { ...filters };
    params[key] = value;
    if (key === "year") { params.make = ""; params.model = ""; }
    if (key === "make") { params.model = ""; }
    submit(params, { method: "get" });
  };

  const statusBadge = (status: string) => {
    if (status === "ACTIVE") return <Badge tone="success">Active</Badge>;
    if (status === "DRAFT") return <Badge tone="attention">Draft</Badge>;
    if (status === "ARCHIVED") return <Badge tone="critical">Archived</Badge>;
    return <Badge>Unknown</Badge>;
  };

  const rows = inventoryData.map((p) => [
    p.title,
    statusBadge(p.status),
    p.totalInventory !== null ? (
      <Text as="span" tone={p.totalInventory <= 0 ? "critical" : p.totalInventory < 5 ? "caution" : "success"}>
        {p.totalInventory} units
      </Text>
    ) : "—",
    p.variants?.edges?.length || 0,
    p.variants?.edges?.[0]?.node?.sku || "—",
  ]);

  const totalStock = inventoryData.reduce((sum, p) => sum + (p.totalInventory || 0), 0);
  const outOfStock = inventoryData.filter(p => p.totalInventory <= 0).length;
  const lowStock = inventoryData.filter(p => p.totalInventory > 0 && p.totalInventory < 5).length;

  return (
    <Page title="Inventory by Vehicle">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Select Vehicle</Text>
              <InlineGrid columns={3} gap="300">
                <Select label="Year" options={yearOptions} value={filters.year} onChange={(v) => handleFilterChange("year", v)} />
                <Select label="Make" options={makeOptions} value={filters.make} onChange={(v) => handleFilterChange("make", v)} disabled={!filters.year} />
                <Select label="Model" options={modelOptions} value={filters.model} onChange={(v) => handleFilterChange("model", v)} disabled={!filters.make} />
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        {filters.model && (
          <Layout.Section>
            <InlineGrid columns={3} gap="400">
              <Card>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Total Stock</Text>
                  <Text as="p" variant="heading2xl">{totalStock}</Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Out of Stock</Text>
                  <Text as="p" variant="heading2xl" tone={outOfStock > 0 ? "critical" : undefined}>{outOfStock}</Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Low Stock (&lt;5)</Text>
                  <Text as="p" variant="heading2xl" tone={lowStock > 0 ? "caution" : undefined}>{lowStock}</Text>
                </BlockStack>
              </Card>
            </InlineGrid>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                {filters.model
                  ? `Parts for ${filters.year} ${filters.make} ${filters.model}`
                  : "Select a vehicle to see inventory"}
              </Text>
              {inventoryData.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "numeric", "text"]}
                  headings={["Product", "Status", "Stock", "Variants", "SKU"]}
                  rows={rows}
                />
              ) : filters.model ? (
                <Banner tone="info">
                  <p>No parts found for this vehicle. Add compatibility rules in the Compatibility Manager.</p>
                </Banner>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
