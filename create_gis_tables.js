const { createClient } = require("@libsql/client");
require("dotenv").config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log("Connecting to Turso / LibSQL...");
  
  const createLayerTableSql = `
    CREATE TABLE IF NOT EXISTS "GisLayer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "nameAr" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'feature',
        "category" TEXT NOT NULL DEFAULT 'custom',
        "color" TEXT DEFAULT '#3388ff',
        "isVisible" BOOLEAN NOT NULL DEFAULT 1,
        "isLocked" BOOLEAN NOT NULL DEFAULT 0,
        "opacity" REAL NOT NULL DEFAULT 1.0,
        "order" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    );
  `;

  const createFeatureTableSql = `
    CREATE TABLE IF NOT EXISTS "GisFeature" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "layerId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "coordinates" TEXT NOT NULL,
        "properties" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "GisFeature_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "GisLayer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `;

  try {
    console.log("Creating GisLayer table...");
    await client.execute(createLayerTableSql);
    console.log("GisLayer table created successfully.");

    console.log("Creating GisFeature table...");
    await client.execute(createFeatureTableSql);
    console.log("GisFeature table created successfully.");

    console.log("Database schema migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main().catch(console.error);
