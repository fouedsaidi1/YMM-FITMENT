// app/routes/api.ymm.tsx
// Public API — no auth required (called from storefront widget)
// Returns JSON for cascading dropdowns and product lookups

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=3600",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // GET /api/ymm?action=years
    if (action === "years") {
      const years = await prisma.vehicleYear.findMany({
        orderBy: { year: "desc" },
        select: { year: true },
      });
      return json({ years: years.map(y => y.year) }, { headers: corsHeaders });
    }

    // GET /api/ymm?action=makes&year=2023
    if (action === "makes") {
      const year = parseInt(url.searchParams.get("year") || "");
      if (!year) return json({ error: "year required" }, { status: 400, headers: corsHeaders });

      const makes = await prisma.vehicleMake.findMany({
        where: { year: { year } },
        orderBy: { name: "asc" },
        select: { name: true },
      });
      return json({ makes: makes.map(m => m.name) }, { headers: corsHeaders });
    }

    // GET /api/ymm?action=models&year=2023&make=Toyota
    if (action === "models") {
      const year = parseInt(url.searchParams.get("year") || "");
      const make = url.searchParams.get("make") || "";
      if (!year || !make) return json({ error: "year and make required" }, { status: 400, headers: corsHeaders });

      const models = await prisma.vehicleModel.findMany({
        where: { make: { name: make, year: { year } } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      });
      return json({ models: models.map(m => m.name) }, { headers: corsHeaders });
    }

    // GET /api/ymm?action=parts&year=2023&make=Toyota&model=Camry
    if (action === "parts") {
      const year = parseInt(url.searchParams.get("year") || "");
      const make = url.searchParams.get("make") || "";
      const model = url.searchParams.get("model") || "";
      if (!year || !make || !model) {
        return json({ error: "year, make and model required" }, { status: 400, headers: corsHeaders });
      }

      const compatibilities = await prisma.productCompatibility.findMany({
        where: { model: { name: model, make: { name: make, year: { year } } } },
        select: { shopifyProductId: true, productTitle: true, notes: true },
      });

      return json({
        vehicle: `${year} ${make} ${model}`,
        count: compatibilities.length,
        products: compatibilities,
      }, { headers: corsHeaders });
    }

    return json({ error: "Invalid action. Use: years, makes, models, parts" }, { status: 400, headers: corsHeaders });

  } catch (error) {
    console.error("YMM API error:", error);
    return json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
};
