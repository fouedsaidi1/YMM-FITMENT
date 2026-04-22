// app/routes/app._index.tsx
import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Page, Layout, Card, Text, BlockStack, InlineGrid, Box,
  Button, Banner, DataTable, Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities] = await Promise.all([
    prisma.productCompatibility.count(),
    prisma.vehicleModel.count(),
    prisma.garageVehicle.count({ where: { shop: session.shop } }),
    prisma.importJob.findFirst({ where: { shop: session.shop }, orderBy: { createdAt: "desc" } }),
    prisma.productCompatibility.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { model: { include: { make: { include: { year: true } } } } },
    }),
  ]);
  return json({ totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities });
};

export default function Index() {
  const { totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities } = useLoaderData<typeof loader>();

  const rows = recentCompatibilities.map((c) => [
    c.productTitle,
    `${c.model.make.year.year} ${c.model.make.name} ${c.model.name}`,
    <Badge tone="success">Active</Badge>,
  ]);

  return (
    <Page title="YMM Parts Finder — Dashboard">
      <Layout>
        <Layout.Section>
          <Banner title="Welcome to YMM Parts Finder" tone="info">
            <p>Manage vehicle compatibility, bulk import data, and view customer garage activity.</p>
          </Banner>
        </Layout.Section>
        <Layout.Section>
          <InlineGrid columns={4} gap="400">
            <Card><BlockStack gap="200">
              <Text as="h3" variant="headingMd" tone="subdued">Vehicles in DB</Text>
              <Text as="p" variant="heading2xl">{totalVehicles.toLocaleString()}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Cars & trucks</Text>
            </BlockStack></Card>
            <Card><BlockStack gap="200">
              <Text as="h3" variant="headingMd" tone="subdued">Compatibility Rules</Text>
              <Text as="p" variant="heading2xl">{totalCompatibilities.toLocaleString()}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Product-vehicle mappings</Text>
            </BlockStack></Card>
            <Card><BlockStack gap="200">
              <Text as="h3" variant="headingMd" tone="subdued">Garage Vehicles</Text>
              <Text as="p" variant="heading2xl">{totalGarage.toLocaleString()}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Saved by customers</Text>
            </BlockStack></Card>
            <Card><BlockStack gap="200">
              <Text as="h3" variant="headingMd" tone="subdued">Last Import</Text>
              <Text as="p" variant="headingLg">{lastImport ? `${lastImport.imported} rows` : "—"}</Text>
              <Text as="p" variant="bodySm" tone="subdued">{lastImport ? new Date(lastImport.createdAt).toLocaleDateString() : "No imports yet"}</Text>
            </BlockStack></Card>
          </InlineGrid>
        </Layout.Section>
        <Layout.Section>
          <InlineGrid columns={3} gap="400">
            <Card><BlockStack gap="300">
              <Text as="h3" variant="headingMd">Compatibility</Text>
              <Text as="p" variant="bodySm" tone="subdued">Add or remove which products fit which vehicles.</Text>
              <Button url="/app/compatibility" variant="primary">Manage Compatibility</Button>
            </BlockStack></Card>
            <Card><BlockStack gap="300">
              <Text as="h3" variant="headingMd">Bulk CSV Import</Text>
              <Text as="p" variant="bodySm" tone="subdued">Upload a CSV to import thousands of rules at once.</Text>
              <Button url="/app/import">Import CSV</Button>
            </BlockStack></Card>
            <Card><BlockStack gap="300">
              <Text as="h3" variant="headingMd">Inventory by Vehicle</Text>
              <Text as="p" variant="bodySm" tone="subdued">Check live stock levels filtered by vehicle.</Text>
              <Button url="/app/inventory">View Inventory</Button>
            </BlockStack></Card>
          </InlineGrid>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Recent Compatibility Rules</Text>
              {rows.length > 0 ? (
                <DataTable columnContentTypes={["text","text","text"]} headings={["Product","Vehicle","Status"]} rows={rows} />
              ) : (
                <Box padding="400"><Text as="p" tone="subdued">No rules yet. Use Bulk Import or add manually.</Text></Box>
              )}
              <Button url="/app/compatibility" variant="plain">View all →</Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
