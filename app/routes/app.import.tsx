// app/routes/app.import.tsx
// Bulk CSV import for compatibility rules
// CSV format: year,make,model,product_id,product_title,notes

import { useState, useCallback, useRef } from "react";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Page, Layout, Card, Text, BlockStack, Button, Banner,
  DataTable, Badge, ProgressBar, List, Link, Box,
  InlineStack, Divider, DropZone, Thumbnail, Icon,
} from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const jobs = await prisma.importJob.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return json({ jobs });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "import") {
    const csvText = form.get("csv") as string;
    const filename = form.get("filename") as string || "upload.csv";

    if (!csvText) return json({ error: "No CSV data provided" }, { status: 400 });

    const lines = csvText.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });

    // Create job record
    const job = await prisma.importJob.create({
      data: { shop: session.shop, filename, status: "processing", totalRows: lines.length - 1 },
    });

    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    // Parse header
    const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
    const idx = {
      year: header.indexOf("year"),
      make: header.indexOf("make"),
      model: header.indexOf("model"),
      product_id: header.indexOf("product_id"),
      product_title: header.indexOf("product_title"),
      notes: header.indexOf("notes"),
    };

    if (idx.year === -1 || idx.make === -1 || idx.model === -1 || idx.product_id === -1 || idx.product_title === -1) {
      await prisma.importJob.update({ where: { id: job.id }, data: { status: "failed", errors: JSON.stringify(["Missing required columns: year, make, model, product_id, product_title"]) } });
      return json({ error: "Missing required columns" }, { status: 400 });
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const year = parseInt(cols[idx.year]);
      const make = cols[idx.make];
      const model = cols[idx.model];
      const productId = cols[idx.product_id];
      const productTitle = cols[idx.product_title];
      const notes = idx.notes !== -1 ? cols[idx.notes] : undefined;

      if (!year || !make || !model || !productId || !productTitle) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        skipped++;
        continue;
      }

      try {
        const vehicleModel = await prisma.vehicleModel.findFirst({
          where: { name: model, make: { name: make, year: { year } } },
        });

        if (!vehicleModel) {
          errors.push(`Row ${i + 1}: Vehicle not found — ${year} ${make} ${model}`);
          skipped++;
          continue;
        }

        await prisma.productCompatibility.upsert({
          where: { shopifyProductId_modelId: { shopifyProductId: productId, modelId: vehicleModel.id } },
          update: { productTitle, notes: notes || null },
          create: { shopifyProductId: productId, productTitle, modelId: vehicleModel.id, notes: notes || null },
        });
        imported++;
      } catch (e: any) {
        errors.push(`Row ${i + 1}: ${e.message}`);
        skipped++;
      }
    }

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: errors.length > 0 && imported === 0 ? "failed" : "done",
        imported,
        skipped,
        errors: errors.length ? JSON.stringify(errors.slice(0, 50)) : null,
      },
    });

    return json({ success: true, imported, skipped, errors: errors.slice(0, 10) });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
};

export default function Import() {
  const { jobs } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const nav = useNavigation();
  const isSubmitting = nav.state !== "idle";

  const [csvText, setCsvText] = useState("");
  const [filename, setFilename] = useState("");
  const [preview, setPreview] = useState<string[][]>([]);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const handleDrop = useCallback((_: File[], accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      parsePreview(text);
    };
    reader.readAsText(file);
  }, []);

  function parsePreview(text: string) {
    setParseError("");
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) { setParseError("File must have a header + at least one row."); return; }
    const header = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    const required = ["year", "make", "model", "product_id", "product_title"];
    const missing = required.filter(r => !header.map(h => h.toLowerCase()).includes(r));
    if (missing.length) { setParseError(`Missing columns: ${missing.join(", ")}`); return; }
    const rows = lines.slice(1, 6).map(l => l.split(",").map(c => c.trim().replace(/^"|"$/g, "")));
    setPreview([header, ...rows]);
  }

  function handleImport() {
    if (!csvText) return;
    const fd = new FormData();
    fd.append("intent", "import");
    fd.append("csv", csvText);
    fd.append("filename", filename);
    submit(fd, { method: "post" });
  }

  const statusBadge = (s: string) => {
    if (s === "done") return <Badge tone="success">Done</Badge>;
    if (s === "failed") return <Badge tone="critical">Failed</Badge>;
    if (s === "processing") return <Badge tone="attention">Processing</Badge>;
    return <Badge>Pending</Badge>;
  };

  const jobRows = jobs.map(j => [
    j.filename,
    new Date(j.createdAt).toLocaleString(),
    statusBadge(j.status),
    j.imported,
    j.skipped,
  ]);

  return (
    <Page
      title="Bulk CSV Import"
      secondaryActions={[{
        content: "Download Template",
        onAction: () => {
          const csv = "year,make,model,product_id,product_title,notes\n2023,Toyota,Camry,gid://shopify/Product/123,OEM Brake Pad Set,Front only\n2023,Ford,F-150,gid://shopify/Product/456,Air Filter Kit,";
          const blob = new Blob([csv], { type: "text/csv" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "ymm-compatibility-template.csv";
          a.click();
        },
      }]}
    >
      <Layout>
        <Layout.Section>
          <Banner title="CSV Format" tone="info">
            <p>Required columns: <strong>year, make, model, product_id, product_title</strong>. Optional: <strong>notes</strong>. Use Shopify Product GIDs for product_id (e.g. <code>gid://shopify/Product/123456789</code>). Download the template to get started.</p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Upload CSV File</Text>
              <DropZone onDrop={handleDrop} accept=".csv,text/csv" type="file" allowMultiple={false}>
                {csvText ? (
                  <Box padding="400">
                    <InlineStack gap="200" align="center">
                      <Icon source={NoteIcon} />
                      <Text as="p" variant="bodyMd">{filename} — {csvText.split("\n").length - 1} rows loaded</Text>
                      <Button size="micro" onClick={() => { setCsvText(""); setFilename(""); setPreview([]); setParseError(""); setResult(null); }}>Remove</Button>
                    </InlineStack>
                  </Box>
                ) : (
                  <DropZone.FileUpload actionTitle="Upload CSV" actionHint="or drag and drop your .csv file here" />
                )}
              </DropZone>

              {parseError && <Banner tone="critical"><p>{parseError}</p></Banner>}

              {preview.length > 1 && !parseError && (
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">Preview (first 5 rows):</Text>
                  <DataTable
                    columnContentTypes={preview[0].map(() => "text" as const)}
                    headings={preview[0]}
                    rows={preview.slice(1)}
                  />
                </BlockStack>
              )}

              {result && (
                <Banner tone={result.errors.length > 0 ? "warning" : "success"}>
                  <BlockStack gap="200">
                    <p>Import complete — <strong>{result.imported} imported</strong>, {result.skipped} skipped.</p>
                    {result.errors.length > 0 && (
                      <List>
                        {result.errors.map((e, i) => <List.Item key={i}>{e}</List.Item>)}
                      </List>
                    )}
                  </BlockStack>
                </Banner>
              )}

              <InlineStack gap="200">
                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={!csvText || !!parseError || isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Importing..." : `Import ${csvText ? csvText.split("\n").length - 1 : 0} rows`}
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Import History</Text>
              {jobs.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text", "numeric", "numeric"]}
                  headings={["File", "Date", "Status", "Imported", "Skipped"]}
                  rows={jobRows}
                />
              ) : (
                <Box padding="300">
                  <Text as="p" tone="subdued">No imports yet.</Text>
                </Box>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
