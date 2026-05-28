-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'MONITOR',
    "reserveId" TEXT NOT NULL DEFAULT '',
    "reserve" TEXT,
    "reserveAr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "certifications" TEXT,
    "allowedSections" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Patrol" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "zone" TEXT,
    "zoneAr" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vesselId" TEXT,
    "areaCovered" REAL,
    "duration" REAL,
    "weather" TEXT,
    "observations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "routeCoordinates" TEXT,
    "incidentsReported" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Patrol_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vessel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "regNumber" TEXT NOT NULL,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fuelLevel" REAL NOT NULL DEFAULT 100,
    "healthScore" REAL NOT NULL DEFAULT 100,
    "engineHours" REAL NOT NULL DEFAULT 0,
    "lastService" DATETIME
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "officerId" TEXT NOT NULL,
    "locationLat" REAL NOT NULL,
    "locationLng" REAL NOT NULL,
    "types" TEXT,
    "typeAr" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "violatorName" TEXT,
    "vesselName" TEXT,
    "actionTaken" TEXT,
    "fineAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "location" TEXT,
    "locationAr" TEXT,
    "description" TEXT,
    "patrolId" TEXT,
    CONSTRAINT "Violation_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Violation_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "Patrol" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "depthRange" TEXT,
    "visibility" REAL,
    "waterTemp" REAL,
    "ph" REAL,
    "salinity" REAL,
    "healthScore" REAL,
    CONSTRAINT "Survey_observerId_fkey" FOREIGN KEY ("observerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EiaCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNANSWERED',
    "createdBy" TEXT NOT NULL DEFAULT 'مصطفى لايق',
    "updatedBy" TEXT,
    "isDeletePending" BOOLEAN NOT NULL DEFAULT false,
    "deleteReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EiaCostFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "costId" TEXT NOT NULL,
    CONSTRAINT "EiaCostFile_costId_fkey" FOREIGN KEY ("costId") REFERENCES "EiaCost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EiaInspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "studyFileUrl" TEXT,
    "reportFileUrl" TEXT,
    "createdBy" TEXT NOT NULL DEFAULT 'مصطفى لايق',
    "updatedBy" TEXT,
    "isDeletePending" BOOLEAN NOT NULL DEFAULT false,
    "deleteReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EiaViolation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "locationName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'مصطفى لايق',
    "updatedBy" TEXT,
    "isDeletePending" BOOLEAN NOT NULL DEFAULT false,
    "deleteReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EiaViolationFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    CONSTRAINT "EiaViolationFile_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "EiaViolation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EiaAccident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "reportFileUrl" TEXT,
    "createdBy" TEXT NOT NULL DEFAULT 'مصطفى لايق',
    "updatedBy" TEXT,
    "isDeletePending" BOOLEAN NOT NULL DEFAULT false,
    "deleteReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReserveProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "locationAr" TEXT NOT NULL,
    "area" REAL NOT NULL,
    "establishedYear" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "coords" TEXT NOT NULL DEFAULT '',
    "speciesCount" INTEGER NOT NULL DEFAULT 0,
    "healthIndex" REAL NOT NULL DEFAULT 0.0,
    "statusAr" TEXT NOT NULL DEFAULT '',
    "activities" TEXT NOT NULL DEFAULT '',
    "activitiesAr" TEXT NOT NULL DEFAULT '',
    "rules" TEXT NOT NULL DEFAULT '',
    "rulesAr" TEXT NOT NULL DEFAULT '',
    "ticketPrice" TEXT NOT NULL DEFAULT '',
    "ticketPriceAr" TEXT NOT NULL DEFAULT '',
    "famousSpecies" TEXT NOT NULL DEFAULT '',
    "famousSpeciesAr" TEXT NOT NULL DEFAULT '',
    "gallery" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OpenDataDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLIC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VisitorGuideSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "links" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HomepageSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'home-config',
    "heroTitle" TEXT NOT NULL,
    "heroTitleAr" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroSubtitleAr" TEXT NOT NULL,
    "announcements" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "locationAr" TEXT NOT NULL,
    "observerId" TEXT NOT NULL,
    "observerName" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "score" REAL NOT NULL,
    "indicators" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MarineSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "typeAr" TEXT DEFAULT '',
    "imageUrl" TEXT,
    "status" TEXT NOT NULL,
    "statusAr" TEXT DEFAULT '',
    "description" TEXT DEFAULT '',
    "descriptionAr" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MapLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "typeAr" TEXT DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "statusAr" TEXT DEFAULT '',
    "description" TEXT DEFAULT '',
    "descriptionAr" TEXT DEFAULT '',
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EcoProgramReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "program" TEXT NOT NULL,
    "subType" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "locationAr" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "observerName" TEXT NOT NULL,
    "details" TEXT,
    "attachedFileUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StrandingCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "locationAr" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "species" TEXT,
    "speciesAr" TEXT,
    "attachedFileUrl" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Sighting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "locationAr" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "species" TEXT NOT NULL,
    "speciesAr" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "observerName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BeachSurvey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "locationAr" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "attachedFileUrl" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PatrolMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PatrolMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Patrol" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PatrolMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_regNumber_key" ON "Vessel"("regNumber");

-- CreateIndex
CREATE UNIQUE INDEX "_PatrolMembers_AB_unique" ON "_PatrolMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_PatrolMembers_B_index" ON "_PatrolMembers"("B");

