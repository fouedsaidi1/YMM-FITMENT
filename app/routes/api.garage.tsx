// app/routes/api.garage.tsx
// Public API for My Garage feature — called from storefront JS
// Uses signed customer token or anonymous session token for identity

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Customer-Token, X-Shop-Domain",
};

function getIdentity(request: Request): { customerId: string; shop: string } | null {
  const token = request.headers.get("X-Customer-Token");
  const shop = request.headers.get("X-Shop-Domain");
  if (!token || !shop) return null;
  return { customerId: token, shop };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const identity = getIdentity(request);
  if (!identity) return json({ error: "Missing identity headers" }, { status: 401, headers: cors });

  const vehicles = await prisma.garageVehicle.findMany({
    where: { customerId: identity.customerId, shop: identity.shop },
    include: { model: { include: { make: { include: { year: true } } } } },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
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
      label: `${v.model.make.year.year} ${v.model.make.name} ${v.model.name}${v.submodel ? " " + v.submodel : ""}`,
    })),
  }, { headers: cors });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const identity = getIdentity(request);
  if (!identity) return json({ error: "Missing identity headers" }, { status: 401, headers: cors });

  const body = await request.json().catch(() => ({}));

  // POST — add vehicle
  if (request.method === "POST") {
    const { year, make, model, nickname, submodel, engine, setDefault } = body;
    if (!year || !make || !model) return json({ error: "year, make, model required" }, { status: 400, headers: cors });

    const vehicleModel = await prisma.vehicleModel.findFirst({
      where: { name: model, make: { name: make, year: { year: parseInt(year) } } },
    });
    if (!vehicleModel) return json({ error: "Vehicle not found in database" }, { status: 404, headers: cors });

    // Max 5 vehicles per garage
    const count = await prisma.garageVehicle.count({ where: { customerId: identity.customerId, shop: identity.shop } });
    if (count >= 5) return json({ error: "Garage is full (max 5 vehicles). Remove one first." }, { status: 400, headers: cors });

    // If setDefault, clear existing defaults
    if (setDefault) {
      await prisma.garageVehicle.updateMany({
        where: { customerId: identity.customerId, shop: identity.shop },
        data: { isDefault: false },
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
        isDefault: setDefault || count === 0, // first vehicle is always default
      },
      include: { model: { include: { make: { include: { year: true } } } } },
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
        label: `${vehicle.model.make.year.year} ${vehicle.model.make.name} ${vehicle.model.name}`,
      },
    }, { headers: cors });
  }

  // DELETE — remove vehicle
  if (request.method === "DELETE") {
    const { id } = body;
    if (!id) return json({ error: "id required" }, { status: 400, headers: cors });

    const vehicle = await prisma.garageVehicle.findFirst({
      where: { id: parseInt(id), customerId: identity.customerId, shop: identity.shop },
    });
    if (!vehicle) return json({ error: "Vehicle not found" }, { status: 404, headers: cors });

    await prisma.garageVehicle.delete({ where: { id: parseInt(id) } });

    // If deleted vehicle was default, make newest the default
    if (vehicle.isDefault) {
      const next = await prisma.garageVehicle.findFirst({
        where: { customerId: identity.customerId, shop: identity.shop },
        orderBy: { createdAt: "desc" },
      });
      if (next) await prisma.garageVehicle.update({ where: { id: next.id }, data: { isDefault: true } });
    }

    return json({ success: true }, { headers: cors });
  }

  // PATCH — set default vehicle
  if (request.method === "PATCH") {
    const { id } = body;
    if (!id) return json({ error: "id required" }, { status: 400, headers: cors });

    await prisma.garageVehicle.updateMany({
      where: { customerId: identity.customerId, shop: identity.shop },
      data: { isDefault: false },
    });
    await prisma.garageVehicle.update({ where: { id: parseInt(id) }, data: { isDefault: true } });

    return json({ success: true }, { headers: cors });
  }

  return json({ error: "Method not allowed" }, { status: 405, headers: cors });
};
