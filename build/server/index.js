var _a;
import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useCallback } from "react";
import { Button, Page, Layout, Card, BlockStack, Text, InlineGrid, Select, InlineStack, Spinner, DataTable, Box, Banner, Modal, TextField, Badge, DropZone, Icon, List } from "@shopify/polaris";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, AppDistribution, LATEST_API_VERSION } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { NoteIcon } from "@shopify/polaris-icons";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function App() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App
}, Symbol.toStringTag, { value: "Module" }));
const prisma = global.prismaClient || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  global.prismaClient = prisma;
}
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  webhooks: {},
  hooks: {},
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
    v3_lineItemBilling: true,
    unstable_newEmbeddedAuthStrategy: true
  }
});
shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const loader$5 = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const year = url.searchParams.get("year") || "";
  const make = url.searchParams.get("make") || "";
  const model = url.searchParams.get("model") || "";
  const years = await prisma.vehicleYear.findMany({ orderBy: { year: "desc" } });
  const makes = year ? await prisma.vehicleMake.findMany({
    where: { year: { year: parseInt(year) } },
    orderBy: { name: "asc" }
  }) : [];
  const models = make && year ? await prisma.vehicleModel.findMany({
    where: { make: { name: make, year: { year: parseInt(year) } } },
    orderBy: { name: "asc" }
  }) : [];
  const compatibilities = model ? await prisma.productCompatibility.findMany({
    where: { model: { name: model, make: { name: make, year: { year: parseInt(year) } } } },
    include: { model: { include: { make: { include: { year: true } } } } },
    orderBy: { createdAt: "desc" }
  }) : [];
  return json({ years, makes, models, compatibilities, filters: { year, make, model } });
};
const action$2 = async ({ request }) => {
  await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "add") {
    const modelId = parseInt(form.get("modelId"));
    const shopifyProductId = form.get("shopifyProductId");
    const productTitle = form.get("productTitle");
    const notes = form.get("notes");
    await prisma.productCompatibility.upsert({
      where: { shopifyProductId_modelId: { shopifyProductId, modelId } },
      update: { productTitle, notes },
      create: { shopifyProductId, productTitle, modelId, notes }
    });
    return json({ success: true });
  }
  if (intent === "delete") {
    const id = parseInt(form.get("id"));
    await prisma.productCompatibility.delete({ where: { id } });
    return json({ success: true });
  }
  return json({ error: "Unknown intent" }, { status: 400 });
};
function Compatibility() {
  var _a2;
  const { years, makes, models, compatibilities, filters } = useLoaderData();
  const submit = useSubmit();
  const nav = useNavigation();
  const loading = nav.state !== "idle";
  const [modalOpen, setModalOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const yearOptions = [{ label: "Select year", value: "" }, ...years.map((y) => ({ label: String(y.year), value: String(y.year) }))];
  const makeOptions = [{ label: "Select make", value: "" }, ...makes.map((m) => ({ label: m.name, value: m.name }))];
  const modelOptions = [{ label: "Select model", value: "" }, ...models.map((m) => ({ label: m.name, value: String(m.id) }))];
  const handleFilterChange = (key, value) => {
    const params = { ...filters };
    params[key] = value;
    if (key === "year") {
      params.make = "";
      params.model = "";
    }
    if (key === "make") {
      params.model = "";
    }
    submit(params, { method: "get" });
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
    setProductId("");
    setProductTitle("");
    setNotes("");
  };
  const handleDelete = (id) => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", String(id));
    submit(formData, { method: "post" });
  };
  const rows = compatibilities.map((c) => [
    c.productTitle,
    `${c.model.make.year.year} ${c.model.make.name} ${c.model.name}`,
    c.notes || "—",
    /* @__PURE__ */ jsx(Button, { tone: "critical", size: "micro", onClick: () => handleDelete(c.id), children: "Remove" })
  ]);
  return /* @__PURE__ */ jsxs(
    Page,
    {
      title: "Compatibility Manager",
      primaryAction: filters.model ? { content: "Add Compatibility Rule", onAction: () => {
        var _a3;
        setSelectedModelId(((_a3 = models.find((m) => m.name === filters.model)) == null ? void 0 : _a3.id.toString()) || "");
        setModalOpen(true);
      } } : void 0,
      children: [
        /* @__PURE__ */ jsxs(Layout, { children: [
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
            /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Filter by Vehicle" }),
            /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "300", children: [
              /* @__PURE__ */ jsx(Select, { label: "Year", options: yearOptions, value: filters.year, onChange: (v) => handleFilterChange("year", v) }),
              /* @__PURE__ */ jsx(Select, { label: "Make", options: makeOptions, value: filters.make, onChange: (v) => handleFilterChange("make", v), disabled: !filters.year }),
              /* @__PURE__ */ jsx(Select, { label: "Model", options: modelOptions, value: filters.model ? String(((_a2 = models.find((m) => m.name === filters.model)) == null ? void 0 : _a2.id) || "") : "", onChange: (v) => {
                var _a3;
                const name = ((_a3 = models.find((m) => m.id === parseInt(v))) == null ? void 0 : _a3.name) || "";
                handleFilterChange("model", name);
              }, disabled: !filters.make })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
              /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: filters.model ? `Parts compatible with ${filters.year} ${filters.make} ${filters.model}` : "Select a vehicle above to see compatible parts" }),
              loading && /* @__PURE__ */ jsx(Spinner, { size: "small" })
            ] }),
            compatibilities.length > 0 ? /* @__PURE__ */ jsx(
              DataTable,
              {
                columnContentTypes: ["text", "text", "text", "text"],
                headings: ["Product", "Vehicle", "Notes", "Action"],
                rows
              }
            ) : filters.model ? /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Banner, { tone: "warning", children: /* @__PURE__ */ jsx("p", { children: 'No compatible parts found for this vehicle. Click "Add Compatibility Rule" to add one.' }) }) }) : null
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx(
          Modal,
          {
            open: modalOpen,
            onClose: () => setModalOpen(false),
            title: `Add part compatible with ${filters.year} ${filters.make} ${filters.model}`,
            primaryAction: { content: "Add Rule", onAction: handleAdd, disabled: !productId || !productTitle },
            secondaryActions: [{ content: "Cancel", onAction: () => setModalOpen(false) }],
            children: /* @__PURE__ */ jsx(Modal.Section, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
              /* @__PURE__ */ jsx(
                TextField,
                {
                  label: "Shopify Product GID",
                  value: productId,
                  onChange: setProductId,
                  placeholder: "gid://shopify/Product/123456789",
                  helpText: "Find this in your Shopify admin URL when viewing the product",
                  autoComplete: "off"
                }
              ),
              /* @__PURE__ */ jsx(
                TextField,
                {
                  label: "Product Title",
                  value: productTitle,
                  onChange: setProductTitle,
                  placeholder: "e.g. OEM Brake Pad Set Front",
                  autoComplete: "off"
                }
              ),
              /* @__PURE__ */ jsx(
                TextField,
                {
                  label: "Notes (optional)",
                  value: notes,
                  onChange: setNotes,
                  placeholder: "e.g. Fits 4WD only",
                  multiline: 2,
                  autoComplete: "off"
                }
              )
            ] }) })
          }
        )
      ]
    }
  );
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: Compatibility,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ request }) => {
  var _a2;
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const year = url.searchParams.get("year") || "";
  const make = url.searchParams.get("make") || "";
  const model = url.searchParams.get("model") || "";
  const years = await prisma.vehicleYear.findMany({ orderBy: { year: "desc" } });
  const makes = year ? await prisma.vehicleMake.findMany({ where: { year: { year: parseInt(year) } }, orderBy: { name: "asc" } }) : [];
  const models = make && year ? await prisma.vehicleModel.findMany({ where: { make: { name: make, year: { year: parseInt(year) } } }, orderBy: { name: "asc" } }) : [];
  let inventoryData = [];
  if (model && make && year) {
    const compatibilities = await prisma.productCompatibility.findMany({
      where: { model: { name: model, make: { name: make, year: { year: parseInt(year) } } } }
    });
    if (compatibilities.length > 0) {
      const productIds = compatibilities.map((c) => c.shopifyProductId);
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
        inventoryData = (((_a2 = data.data) == null ? void 0 : _a2.nodes) || []).filter(Boolean);
      } catch (e) {
        inventoryData = compatibilities.map((c) => ({
          id: c.shopifyProductId,
          title: c.productTitle,
          status: "UNKNOWN",
          totalInventory: null,
          variants: { edges: [] }
        }));
      }
    }
  }
  return json({ years, makes, models, inventoryData, filters: { year, make, model } });
};
function Inventory() {
  const { years, makes, models, inventoryData, filters } = useLoaderData();
  const submit = useSubmit();
  const yearOptions = [{ label: "Select year", value: "" }, ...years.map((y) => ({ label: String(y.year), value: String(y.year) }))];
  const makeOptions = [{ label: "Select make", value: "" }, ...makes.map((m) => ({ label: m.name, value: m.name }))];
  const modelOptions = [{ label: "Select model", value: "" }, ...models.map((m) => ({ label: m.name, value: m.name }))];
  const handleFilterChange = (key, value) => {
    const params = { ...filters };
    params[key] = value;
    if (key === "year") {
      params.make = "";
      params.model = "";
    }
    if (key === "make") {
      params.model = "";
    }
    submit(params, { method: "get" });
  };
  const statusBadge = (status) => {
    if (status === "ACTIVE") return /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Active" });
    if (status === "DRAFT") return /* @__PURE__ */ jsx(Badge, { tone: "attention", children: "Draft" });
    if (status === "ARCHIVED") return /* @__PURE__ */ jsx(Badge, { tone: "critical", children: "Archived" });
    return /* @__PURE__ */ jsx(Badge, { children: "Unknown" });
  };
  const rows = inventoryData.map((p) => {
    var _a2, _b, _c, _d, _e, _f;
    return [
      p.title,
      statusBadge(p.status),
      p.totalInventory !== null ? /* @__PURE__ */ jsxs(Text, { as: "span", tone: p.totalInventory <= 0 ? "critical" : p.totalInventory < 5 ? "caution" : "success", children: [
        p.totalInventory,
        " units"
      ] }) : "—",
      ((_b = (_a2 = p.variants) == null ? void 0 : _a2.edges) == null ? void 0 : _b.length) || 0,
      ((_f = (_e = (_d = (_c = p.variants) == null ? void 0 : _c.edges) == null ? void 0 : _d[0]) == null ? void 0 : _e.node) == null ? void 0 : _f.sku) || "—"
    ];
  });
  const totalStock = inventoryData.reduce((sum, p) => sum + (p.totalInventory || 0), 0);
  const outOfStock = inventoryData.filter((p) => p.totalInventory <= 0).length;
  const lowStock = inventoryData.filter((p) => p.totalInventory > 0 && p.totalInventory < 5).length;
  return /* @__PURE__ */ jsx(Page, { title: "Inventory by Vehicle", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
      /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Select Vehicle" }),
      /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "300", children: [
        /* @__PURE__ */ jsx(Select, { label: "Year", options: yearOptions, value: filters.year, onChange: (v) => handleFilterChange("year", v) }),
        /* @__PURE__ */ jsx(Select, { label: "Make", options: makeOptions, value: filters.make, onChange: (v) => handleFilterChange("make", v), disabled: !filters.year }),
        /* @__PURE__ */ jsx(Select, { label: "Model", options: modelOptions, value: filters.model, onChange: (v) => handleFilterChange("model", v), disabled: !filters.make })
      ] })
    ] }) }) }),
    filters.model && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "400", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Total Stock" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", children: totalStock })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Out of Stock" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", tone: outOfStock > 0 ? "critical" : void 0, children: outOfStock })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Low Stock (<5)" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", tone: lowStock > 0 ? "caution" : void 0, children: lowStock })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
      /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: filters.model ? `Parts for ${filters.year} ${filters.make} ${filters.model}` : "Select a vehicle to see inventory" }),
      inventoryData.length > 0 ? /* @__PURE__ */ jsx(
        DataTable,
        {
          columnContentTypes: ["text", "text", "numeric", "numeric", "text"],
          headings: ["Product", "Status", "Stock", "Variants", "SKU"],
          rows
        }
      ) : filters.model ? /* @__PURE__ */ jsx(Banner, { tone: "info", children: /* @__PURE__ */ jsx("p", { children: "No parts found for this vehicle. Add compatibility rules in the Compatibility Manager." }) }) : null
    ] }) }) })
  ] }) });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Inventory,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Customer-Token, X-Shop-Domain"
};
function getIdentity(request) {
  const token = request.headers.get("X-Customer-Token");
  const shop = request.headers.get("X-Shop-Domain");
  if (!token || !shop) return null;
  return { customerId: token, shop };
}
const loader$3 = async ({ request }) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const identity = getIdentity(request);
  if (!identity) return json({ error: "Missing identity headers" }, { status: 401, headers: cors });
  const vehicles = await prisma.garageVehicle.findMany({
    where: { customerId: identity.customerId, shop: identity.shop },
    include: { model: { include: { make: { include: { year: true } } } } },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
  });
  return json({
    vehicles: vehicles.map((v) => ({
      id: v.id,
      nickname: v.nickname,
      year: v.model.make.year.year,
      make: v.model.make.name,
      model: v.model.name,
      submodel: v.submodel,
      engine: v.engine,
      isDefault: v.isDefault,
      label: `${v.model.make.year.year} ${v.model.make.name} ${v.model.name}${v.submodel ? " " + v.submodel : ""}`
    }))
  }, { headers: cors });
};
const action$1 = async ({ request }) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const identity = getIdentity(request);
  if (!identity) return json({ error: "Missing identity headers" }, { status: 401, headers: cors });
  const body = await request.json().catch(() => ({}));
  if (request.method === "POST") {
    const { year, make, model, nickname, submodel, engine, setDefault } = body;
    if (!year || !make || !model) return json({ error: "year, make, model required" }, { status: 400, headers: cors });
    const vehicleModel = await prisma.vehicleModel.findFirst({
      where: { name: model, make: { name: make, year: { year: parseInt(year) } } }
    });
    if (!vehicleModel) return json({ error: "Vehicle not found in database" }, { status: 404, headers: cors });
    const count = await prisma.garageVehicle.count({ where: { customerId: identity.customerId, shop: identity.shop } });
    if (count >= 5) return json({ error: "Garage is full (max 5 vehicles). Remove one first." }, { status: 400, headers: cors });
    if (setDefault) {
      await prisma.garageVehicle.updateMany({
        where: { customerId: identity.customerId, shop: identity.shop },
        data: { isDefault: false }
      });
    }
    const vehicle = await prisma.garageVehicle.create({
      data: {
        customerId: identity.customerId,
        shop: identity.shop,
        modelId: vehicleModel.id,
        nickname: nickname || null,
        submodel: submodel || null,
        engine: engine || null,
        isDefault: setDefault || count === 0
        // first vehicle is always default
      },
      include: { model: { include: { make: { include: { year: true } } } } }
    });
    return json({
      success: true,
      vehicle: {
        id: vehicle.id,
        nickname: vehicle.nickname,
        year: vehicle.model.make.year.year,
        make: vehicle.model.make.name,
        model: vehicle.model.name,
        submodel: vehicle.submodel,
        engine: vehicle.engine,
        isDefault: vehicle.isDefault,
        label: `${vehicle.model.make.year.year} ${vehicle.model.make.name} ${vehicle.model.name}`
      }
    }, { headers: cors });
  }
  if (request.method === "DELETE") {
    const { id } = body;
    if (!id) return json({ error: "id required" }, { status: 400, headers: cors });
    const vehicle = await prisma.garageVehicle.findFirst({
      where: { id: parseInt(id), customerId: identity.customerId, shop: identity.shop }
    });
    if (!vehicle) return json({ error: "Vehicle not found" }, { status: 404, headers: cors });
    await prisma.garageVehicle.delete({ where: { id: parseInt(id) } });
    if (vehicle.isDefault) {
      const next = await prisma.garageVehicle.findFirst({
        where: { customerId: identity.customerId, shop: identity.shop },
        orderBy: { createdAt: "desc" }
      });
      if (next) await prisma.garageVehicle.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return json({ success: true }, { headers: cors });
  }
  if (request.method === "PATCH") {
    const { id } = body;
    if (!id) return json({ error: "id required" }, { status: 400, headers: cors });
    await prisma.garageVehicle.updateMany({
      where: { customerId: identity.customerId, shop: identity.shop },
      data: { isDefault: false }
    });
    await prisma.garageVehicle.update({ where: { id: parseInt(id) }, data: { isDefault: true } });
    return json({ success: true }, { headers: cors });
  }
  return json({ error: "Method not allowed" }, { status: 405, headers: cors });
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const jobs = await prisma.importJob.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 10
  });
  return json({ jobs });
};
const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "import") {
    const csvText = form.get("csv");
    const filename = form.get("filename") || "upload.csv";
    if (!csvText) return json({ error: "No CSV data provided" }, { status: 400 });
    const lines = csvText.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
    const job = await prisma.importJob.create({
      data: { shop: session.shop, filename, status: "processing", totalRows: lines.length - 1 }
    });
    const errors = [];
    let imported = 0;
    let skipped = 0;
    const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
    const idx = {
      year: header.indexOf("year"),
      make: header.indexOf("make"),
      model: header.indexOf("model"),
      product_id: header.indexOf("product_id"),
      product_title: header.indexOf("product_title"),
      notes: header.indexOf("notes")
    };
    if (idx.year === -1 || idx.make === -1 || idx.model === -1 || idx.product_id === -1 || idx.product_title === -1) {
      await prisma.importJob.update({ where: { id: job.id }, data: { status: "failed", errors: JSON.stringify(["Missing required columns: year, make, model, product_id, product_title"]) } });
      return json({ error: "Missing required columns" }, { status: 400 });
    }
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const year = parseInt(cols[idx.year]);
      const make = cols[idx.make];
      const model = cols[idx.model];
      const productId = cols[idx.product_id];
      const productTitle = cols[idx.product_title];
      const notes = idx.notes !== -1 ? cols[idx.notes] : void 0;
      if (!year || !make || !model || !productId || !productTitle) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        skipped++;
        continue;
      }
      try {
        const vehicleModel = await prisma.vehicleModel.findFirst({
          where: { name: model, make: { name: make, year: { year } } }
        });
        if (!vehicleModel) {
          errors.push(`Row ${i + 1}: Vehicle not found — ${year} ${make} ${model}`);
          skipped++;
          continue;
        }
        await prisma.productCompatibility.upsert({
          where: { shopifyProductId_modelId: { shopifyProductId: productId, modelId: vehicleModel.id } },
          update: { productTitle, notes: notes || null },
          create: { shopifyProductId: productId, productTitle, modelId: vehicleModel.id, notes: notes || null }
        });
        imported++;
      } catch (e) {
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
        errors: errors.length ? JSON.stringify(errors.slice(0, 50)) : null
      }
    });
    return json({ success: true, imported, skipped, errors: errors.slice(0, 10) });
  }
  return json({ error: "Unknown intent" }, { status: 400 });
};
function Import() {
  const { jobs } = useLoaderData();
  const submit = useSubmit();
  const nav = useNavigation();
  const isSubmitting = nav.state !== "idle";
  const [csvText, setCsvText] = useState("");
  const [filename, setFilename] = useState("");
  const [preview, setPreview] = useState([]);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState(null);
  const handleDrop = useCallback((_, accepted) => {
    const file = accepted[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a2;
      const text = (_a2 = e.target) == null ? void 0 : _a2.result;
      setCsvText(text);
      parsePreview(text);
    };
    reader.readAsText(file);
  }, []);
  function parsePreview(text) {
    setParseError("");
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) {
      setParseError("File must have a header + at least one row.");
      return;
    }
    const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const required = ["year", "make", "model", "product_id", "product_title"];
    const missing = required.filter((r) => !header.map((h) => h.toLowerCase()).includes(r));
    if (missing.length) {
      setParseError(`Missing columns: ${missing.join(", ")}`);
      return;
    }
    const rows = lines.slice(1, 6).map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
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
  const statusBadge = (s) => {
    if (s === "done") return /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Done" });
    if (s === "failed") return /* @__PURE__ */ jsx(Badge, { tone: "critical", children: "Failed" });
    if (s === "processing") return /* @__PURE__ */ jsx(Badge, { tone: "attention", children: "Processing" });
    return /* @__PURE__ */ jsx(Badge, { children: "Pending" });
  };
  const jobRows = jobs.map((j) => [
    j.filename,
    new Date(j.createdAt).toLocaleString(),
    statusBadge(j.status),
    j.imported,
    j.skipped
  ]);
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "Bulk CSV Import",
      secondaryActions: [{
        content: "Download Template",
        onAction: () => {
          const csv = "year,make,model,product_id,product_title,notes\n2023,Toyota,Camry,gid://shopify/Product/123,OEM Brake Pad Set,Front only\n2023,Ford,F-150,gid://shopify/Product/456,Air Filter Kit,";
          const blob = new Blob([csv], { type: "text/csv" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "ymm-compatibility-template.csv";
          a.click();
        }
      }],
      children: /* @__PURE__ */ jsxs(Layout, { children: [
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Banner, { title: "CSV Format", tone: "info", children: /* @__PURE__ */ jsxs("p", { children: [
          "Required columns: ",
          /* @__PURE__ */ jsx("strong", { children: "year, make, model, product_id, product_title" }),
          ". Optional: ",
          /* @__PURE__ */ jsx("strong", { children: "notes" }),
          ". Use Shopify Product GIDs for product_id (e.g. ",
          /* @__PURE__ */ jsx("code", { children: "gid://shopify/Product/123456789" }),
          "). Download the template to get started."
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Upload CSV File" }),
          /* @__PURE__ */ jsx(DropZone, { onDrop: handleDrop, accept: ".csv,text/csv", type: "file", allowMultiple: false, children: csvText ? /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: NoteIcon }),
            /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
              filename,
              " — ",
              csvText.split("\n").length - 1,
              " rows loaded"
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "micro", onClick: () => {
              setCsvText("");
              setFilename("");
              setPreview([]);
              setParseError("");
              setResult(null);
            }, children: "Remove" })
          ] }) }) : /* @__PURE__ */ jsx(DropZone.FileUpload, { actionTitle: "Upload CSV", actionHint: "or drag and drop your .csv file here" }) }),
          parseError && /* @__PURE__ */ jsx(Banner, { tone: "critical", children: /* @__PURE__ */ jsx("p", { children: parseError }) }),
          preview.length > 1 && !parseError && /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Preview (first 5 rows):" }),
            /* @__PURE__ */ jsx(
              DataTable,
              {
                columnContentTypes: preview[0].map(() => "text"),
                headings: preview[0],
                rows: preview.slice(1)
              }
            )
          ] }),
          result && /* @__PURE__ */ jsx(Banner, { tone: result.errors.length > 0 ? "warning" : "success", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              "Import complete — ",
              /* @__PURE__ */ jsxs("strong", { children: [
                result.imported,
                " imported"
              ] }),
              ", ",
              result.skipped,
              " skipped."
            ] }),
            result.errors.length > 0 && /* @__PURE__ */ jsx(List, { children: result.errors.map((e, i) => /* @__PURE__ */ jsx(List.Item, { children: e }, i)) })
          ] }) }),
          /* @__PURE__ */ jsx(InlineStack, { gap: "200", children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "primary",
              onClick: handleImport,
              disabled: !csvText || !!parseError || isSubmitting,
              loading: isSubmitting,
              children: isSubmitting ? "Importing..." : `Import ${csvText ? csvText.split("\n").length - 1 : 0} rows`
            }
          ) })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Import History" }),
          jobs.length > 0 ? /* @__PURE__ */ jsx(
            DataTable,
            {
              columnContentTypes: ["text", "text", "text", "numeric", "numeric"],
              headings: ["File", "Date", "Status", "Imported", "Skipped"],
              rows: jobRows
            }
          ) : /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "subdued", children: "No imports yet." }) })
        ] }) }) })
      ] })
    }
  );
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Import,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const [totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities] = await Promise.all([
    prisma.productCompatibility.count(),
    prisma.vehicleModel.count(),
    prisma.garageVehicle.count({ where: { shop: session.shop } }),
    prisma.importJob.findFirst({ where: { shop: session.shop }, orderBy: { createdAt: "desc" } }),
    prisma.productCompatibility.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { model: { include: { make: { include: { year: true } } } } }
    })
  ]);
  return json({ totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities });
};
function Index() {
  const { totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities } = useLoaderData();
  const rows = recentCompatibilities.map((c) => [
    c.productTitle,
    `${c.model.make.year.year} ${c.model.make.name} ${c.model.name}`,
    /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Active" })
  ]);
  return /* @__PURE__ */ jsx(Page, { title: "YMM Parts Finder — Dashboard", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Banner, { title: "Welcome to YMM Parts Finder", tone: "info", children: /* @__PURE__ */ jsx("p", { children: "Manage vehicle compatibility, bulk import data, and view customer garage activity." }) }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineGrid, { columns: 4, gap: "400", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", tone: "subdued", children: "Vehicles in DB" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", children: totalVehicles.toLocaleString() }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Cars & trucks" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", tone: "subdued", children: "Compatibility Rules" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", children: totalCompatibilities.toLocaleString() }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Product-vehicle mappings" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", tone: "subdued", children: "Garage Vehicles" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", children: totalGarage.toLocaleString() }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Saved by customers" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", tone: "subdued", children: "Last Import" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", children: lastImport ? `${lastImport.imported} rows` : "—" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: lastImport ? new Date(lastImport.createdAt).toLocaleDateString() : "No imports yet" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "400", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Compatibility" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Add or remove which products fit which vehicles." }),
        /* @__PURE__ */ jsx(Button, { url: "/app/compatibility", variant: "primary", children: "Manage Compatibility" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Bulk CSV Import" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Upload a CSV to import thousands of rules at once." }),
        /* @__PURE__ */ jsx(Button, { url: "/app/import", children: "Import CSV" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Inventory by Vehicle" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Check live stock levels filtered by vehicle." }),
        /* @__PURE__ */ jsx(Button, { url: "/app/inventory", children: "View Inventory" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
      /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Recent Compatibility Rules" }),
      rows.length > 0 ? /* @__PURE__ */ jsx(DataTable, { columnContentTypes: ["text", "text", "text"], headings: ["Product", "Vehicle", "Status"], rows }) : /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "subdued", children: "No rules yet. Use Bulk Import or add manually." }) }),
      /* @__PURE__ */ jsx(Button, { url: "/app/compatibility", variant: "plain", children: "View all →" })
    ] }) }) })
  ] }) });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=3600"
};
const loader = async ({ request }) => {
  const url = new URL(request.url);
  const action2 = url.searchParams.get("action");
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  try {
    if (action2 === "years") {
      const years = await prisma.vehicleYear.findMany({
        orderBy: { year: "desc" },
        select: { year: true }
      });
      return json({ years: years.map((y) => y.year) }, { headers: corsHeaders });
    }
    if (action2 === "makes") {
      const year = parseInt(url.searchParams.get("year") || "");
      if (!year) return json({ error: "year required" }, { status: 400, headers: corsHeaders });
      const makes = await prisma.vehicleMake.findMany({
        where: { year: { year } },
        orderBy: { name: "asc" },
        select: { name: true }
      });
      return json({ makes: makes.map((m) => m.name) }, { headers: corsHeaders });
    }
    if (action2 === "models") {
      const year = parseInt(url.searchParams.get("year") || "");
      const make = url.searchParams.get("make") || "";
      if (!year || !make) return json({ error: "year and make required" }, { status: 400, headers: corsHeaders });
      const models = await prisma.vehicleModel.findMany({
        where: { make: { name: make, year: { year } } },
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      });
      return json({ models: models.map((m) => m.name) }, { headers: corsHeaders });
    }
    if (action2 === "parts") {
      const year = parseInt(url.searchParams.get("year") || "");
      const make = url.searchParams.get("make") || "";
      const model = url.searchParams.get("model") || "";
      if (!year || !make || !model) {
        return json({ error: "year, make and model required" }, { status: 400, headers: corsHeaders });
      }
      const compatibilities = await prisma.productCompatibility.findMany({
        where: { model: { name: model, make: { name: make, year: { year } } } },
        select: { shopifyProductId: true, productTitle: true, notes: true }
      });
      return json({
        vehicle: `${year} ${make} ${model}`,
        count: compatibilities.length,
        products: compatibilities
      }, { headers: corsHeaders });
    }
    return json({ error: "Invalid action. Use: years, makes, models, parts" }, { status: 400, headers: corsHeaders });
  } catch (error) {
    console.error("YMM API error:", error);
    return json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CH56jj3q.js", "imports": ["/assets/components-Cl67j33p.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-C6nVo_Lu.js", "imports": ["/assets/components-Cl67j33p.js"], "css": [] }, "routes/app.compatibility": { "id": "routes/app.compatibility", "parentId": "root", "path": "app/compatibility", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.compatibility-Dmqi0cqd.js", "imports": ["/assets/components-Cl67j33p.js", "/assets/Page-H6tm6e3y.js", "/assets/InlineGrid-DPrW0u7Z.js", "/assets/Select-CUs7HKke.js"], "css": [] }, "routes/app.inventory": { "id": "routes/app.inventory", "parentId": "root", "path": "app/inventory", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.inventory-DYGMhQVg.js", "imports": ["/assets/components-Cl67j33p.js", "/assets/Page-H6tm6e3y.js", "/assets/InlineGrid-DPrW0u7Z.js", "/assets/Select-CUs7HKke.js"], "css": [] }, "routes/api.garage": { "id": "routes/api.garage", "parentId": "root", "path": "api/garage", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.garage-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app.import": { "id": "routes/app.import", "parentId": "root", "path": "app/import", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.import--_pjF3gC.js", "imports": ["/assets/components-Cl67j33p.js", "/assets/Page-H6tm6e3y.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "root", "path": "app", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-Obf2rwxz.js", "imports": ["/assets/components-Cl67j33p.js", "/assets/Page-H6tm6e3y.js", "/assets/InlineGrid-DPrW0u7Z.js"], "css": [] }, "routes/api.ymm": { "id": "routes/api.ymm", "parentId": "root", "path": "api/ymm", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.ymm-l0sNRNKZ.js", "imports": [], "css": [] } }, "url": "/assets/manifest-5786c71f.js", "version": "5786c71f" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/app.compatibility": {
    id: "routes/app.compatibility",
    parentId: "root",
    path: "app/compatibility",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/app.inventory": {
    id: "routes/app.inventory",
    parentId: "root",
    path: "app/inventory",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/api.garage": {
    id: "routes/api.garage",
    parentId: "root",
    path: "api/garage",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/app.import": {
    id: "routes/app.import",
    parentId: "root",
    path: "app/import",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "root",
    path: "app",
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/api.ymm": {
    id: "routes/api.ymm",
    parentId: "root",
    path: "api/ymm",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
