const { createClient } = require("@libsql/client");
require("dotenv").config();

async function run() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  });

  const queries = [
    `CREATE TABLE IF NOT EXISTS "PatrolCrew" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "patrolId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        CONSTRAINT "PatrolCrew_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "Patrol" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PatrolCrew_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "PatrolObservation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "patrolId" TEXT NOT NULL,
        "speciesName" TEXT NOT NULL,
        "count" INTEGER NOT NULL,
        "observationTime" DATETIME NOT NULL,
        "locationName" TEXT NOT NULL,
        "latitude" REAL NOT NULL,
        "longitude" REAL NOT NULL,
        "behaviorNotes" TEXT,
        "photos" TEXT,
        "monitoringRecordId" TEXT,
        CONSTRAINT "PatrolObservation_monitoringRecordId_fkey" FOREIGN KEY ("monitoringRecordId") REFERENCES "Observation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "PatrolObservation_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "Patrol" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "PatrolViolation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "patrolId" TEXT NOT NULL,
        "violatorName" TEXT,
        "vesselName" TEXT,
        "violationType" TEXT NOT NULL,
        "violationDetails" TEXT,
        "dateTime" DATETIME NOT NULL,
        "location" TEXT,
        "latitude" REAL NOT NULL,
        "longitude" REAL NOT NULL,
        "evidencePhotos" TEXT,
        "evidenceFiles" TEXT,
        "immediateAction" TEXT,
        "followupAction" TEXT,
        "status" TEXT NOT NULL DEFAULT 'NEW',
        "severity" TEXT NOT NULL DEFAULT 'LOW',
        "violationRecordId" TEXT,
        CONSTRAINT "PatrolViolation_violationRecordId_fkey" FOREIGN KEY ("violationRecordId") REFERENCES "Violation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "PatrolViolation_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "Patrol" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "PatrolAttachment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "patrolId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        CONSTRAINT "PatrolAttachment_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "Patrol" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "PatrolRoute" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "patrolId" TEXT NOT NULL,
        "geojson" TEXT NOT NULL,
        "startLat" REAL,
        "startLng" REAL,
        "endLat" REAL,
        "endLng" REAL,
        CONSTRAINT "PatrolRoute_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "Patrol" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    `CREATE UNIQUE INDEX IF NOT EXISTS "PatrolRoute_patrolId_key" ON "PatrolRoute"("patrolId");`
  ];

  const alterQueries = [
    `ALTER TABLE "Patrol" ADD COLUMN "type" TEXT DEFAULT 'Marine Patrol';`,
    `ALTER TABLE "Patrol" ADD COLUMN "notes" TEXT;`,
    `ALTER TABLE "Patrol" ADD COLUMN "leaderId" TEXT;`,
    `ALTER TABLE "Patrol" ADD COLUMN "customLeaderName" TEXT;`
  ];

  for (const q of queries) {
    try {
      await client.execute(q);
      console.log("Executed query successfully.");
    } catch(e) { console.error("Error executing query:", e.message); }
  }

  for (const q of alterQueries) {
    try {
      await client.execute(q);
      console.log("Executed alter successfully.");
    } catch(e) { console.log("Alter may already exist or failed:", e.message); }
  }

  console.log("Migration complete.");
}

run();
