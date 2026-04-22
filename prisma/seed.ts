// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VEHICLE_DATA: Record<number, Record<string, string[]>> = {
  2024: {
    Toyota: ["Camry", "Corolla", "RAV4", "Tacoma", "Tundra", "4Runner", "Highlander", "Sequoia"],
    Ford: ["F-150", "F-250", "F-350", "Mustang", "Explorer", "Bronco", "Escape", "Ranger", "Maverick"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Ridgeline", "HR-V", "Passport"],
    Chevrolet: ["Silverado 1500", "Silverado 2500HD", "Colorado", "Equinox", "Traverse", "Tahoe", "Suburban", "Malibu"],
    GMC: ["Sierra 1500", "Sierra 2500HD", "Canyon", "Terrain", "Yukon", "Acadia"],
    Dodge: ["Ram 1500", "Ram 2500", "Ram 3500", "Durango", "Challenger", "Charger"],
    Nissan: ["Frontier", "Titan", "Altima", "Sentra", "Rogue", "Pathfinder", "Armada"],
    Jeep: ["Wrangler", "Gladiator", "Grand Cherokee", "Cherokee", "Compass"],
    BMW: ["3 Series", "5 Series", "7 Series", "X3", "X5", "X7", "M3", "M5"],
    Mercedes: ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "G-Class"],
  },
  2023: {
    Toyota: ["Camry", "Corolla", "RAV4", "Tacoma", "Tundra", "4Runner", "Highlander", "Sequoia"],
    Ford: ["F-150", "F-250", "F-350", "Mustang", "Explorer", "Bronco", "Escape", "Ranger", "Maverick"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Ridgeline", "HR-V", "Odyssey"],
    Chevrolet: ["Silverado 1500", "Silverado 2500HD", "Colorado", "Equinox", "Traverse", "Tahoe", "Suburban", "Blazer"],
    GMC: ["Sierra 1500", "Sierra 2500HD", "Canyon", "Terrain", "Yukon", "Acadia"],
    Dodge: ["Ram 1500", "Ram 2500", "Ram 3500", "Durango", "Challenger", "Charger"],
    Nissan: ["Frontier", "Titan", "Altima", "Sentra", "Rogue", "Pathfinder"],
    Jeep: ["Wrangler", "Gladiator", "Grand Cherokee", "Cherokee", "Compass"],
    BMW: ["3 Series", "5 Series", "X3", "X5", "M3", "M4"],
    Mercedes: ["C-Class", "E-Class", "GLC", "GLE", "G-Class"],
  },
  2022: {
    Toyota: ["Camry", "Corolla", "RAV4", "Tacoma", "Tundra", "4Runner", "Highlander"],
    Ford: ["F-150", "F-250", "F-350", "Mustang", "Explorer", "Bronco", "Escape", "Ranger"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Ridgeline", "Passport"],
    Chevrolet: ["Silverado 1500", "Silverado 2500HD", "Colorado", "Equinox", "Traverse", "Tahoe"],
    GMC: ["Sierra 1500", "Sierra 2500HD", "Canyon", "Terrain", "Yukon"],
    Dodge: ["Ram 1500", "Ram 2500", "Ram 3500", "Durango", "Challenger"],
    Nissan: ["Frontier", "Titan", "Altima", "Rogue", "Pathfinder"],
    Jeep: ["Wrangler", "Gladiator", "Grand Cherokee", "Cherokee"],
    BMW: ["3 Series", "5 Series", "X3", "X5"],
    Mercedes: ["C-Class", "E-Class", "GLC", "GLE"],
  },
  2021: {
    Toyota: ["Camry", "Corolla", "RAV4", "Tacoma", "Tundra", "4Runner", "Highlander", "Sienna"],
    Ford: ["F-150", "F-250", "F-350", "Mustang", "Explorer", "Escape", "Ranger", "Bronco Sport"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Ridgeline", "Odyssey"],
    Chevrolet: ["Silverado 1500", "Silverado 2500HD", "Colorado", "Equinox", "Traverse", "Tahoe"],
    GMC: ["Sierra 1500", "Sierra 2500HD", "Canyon", "Terrain", "Yukon"],
    Dodge: ["Ram 1500", "Ram 2500", "Ram 3500", "Durango", "Challenger", "Charger"],
    Nissan: ["Frontier", "Titan", "Altima", "Sentra", "Rogue"],
    Jeep: ["Wrangler", "Gladiator", "Grand Cherokee", "Cherokee", "Compass"],
    BMW: ["3 Series", "5 Series", "X3", "X5", "M3"],
    Mercedes: ["C-Class", "E-Class", "GLC", "GLE"],
  },
  2020: {
    Toyota: ["Camry", "Corolla", "RAV4", "Tacoma", "Tundra", "4Runner", "Highlander"],
    Ford: ["F-150", "F-250", "F-350", "Mustang", "Explorer", "Escape", "Ranger", "Expedition"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Ridgeline", "Passport"],
    Chevrolet: ["Silverado 1500", "Silverado 2500HD", "Colorado", "Equinox", "Traverse", "Suburban"],
    GMC: ["Sierra 1500", "Sierra 2500HD", "Canyon", "Terrain", "Yukon"],
    Dodge: ["Ram 1500", "Ram 2500", "Ram 3500", "Durango", "Challenger", "Charger"],
    Nissan: ["Frontier", "Titan", "Altima", "Sentra", "Rogue", "Pathfinder"],
    Jeep: ["Wrangler", "Gladiator", "Grand Cherokee", "Cherokee"],
    BMW: ["3 Series", "5 Series", "X3", "X5"],
    Mercedes: ["C-Class", "E-Class", "GLC", "GLE", "G-Class"],
  },
};

async function main() {
  console.log("Seeding vehicle database...");

  for (const [yearStr, makes] of Object.entries(VEHICLE_DATA)) {
    const year = parseInt(yearStr);
    const vehicleYear = await prisma.vehicleYear.upsert({
      where: { year },
      update: {},
      create: { year },
    });

    for (const [makeName, models] of Object.entries(makes)) {
      const vehicleMake = await prisma.vehicleMake.upsert({
        where: { name_yearId: { name: makeName, yearId: vehicleYear.id } },
        update: {},
        create: { name: makeName, yearId: vehicleYear.id },
      });

      for (const modelName of models) {
        await prisma.vehicleModel.upsert({
          where: { name_makeId: { name: modelName, makeId: vehicleMake.id } },
          update: {},
          create: { name: modelName, makeId: vehicleMake.id },
        });
      }
    }

    console.log(`  ✓ Seeded ${year}`);
  }

  console.log("Done seeding vehicle database.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
