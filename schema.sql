-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "idCard" TEXT,
    "registrationNo" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "taxId" TEXT,
    "contactPerson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractNumber" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contractDate" DATETIME NOT NULL,
    "clientId" TEXT NOT NULL,
    "contractorName" TEXT NOT NULL,
    "contractorType" TEXT NOT NULL,
    "contractorIdCard" TEXT,
    "contractorRegistration" TEXT,
    "contractorAddress" TEXT NOT NULL,
    "contractorPosition" TEXT,
    "buildingType" TEXT NOT NULL,
    "buildingFloors" TEXT NOT NULL,
    "buildingArea" TEXT NOT NULL,
    "projectLocation" TEXT NOT NULL,
    "floorPlanDuration" INTEGER NOT NULL DEFAULT 10,
    "threeDDuration" INTEGER NOT NULL DEFAULT 15,
    "constructionDuration" INTEGER NOT NULL DEFAULT 20,
    "totalFee" REAL NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "witness1Name" TEXT,
    "witness1Signature" TEXT,
    "witness2Name" TEXT,
    "witness2Signature" TEXT,
    "clientSignature" TEXT,
    "contractorSignature" TEXT,
    "clientSignDate" DATETIME,
    "contractorSignDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

