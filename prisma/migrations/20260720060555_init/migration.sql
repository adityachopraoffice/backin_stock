-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "selectedTemplate" TEXT NOT NULL DEFAULT 'minimal',
    "formTitle" TEXT NOT NULL DEFAULT 'Notify me when back in stock',
    "buttonText" TEXT NOT NULL DEFAULT 'Notify Me',
    "successMessage" TEXT NOT NULL DEFAULT 'You''ll be notified when this is back!',
    "currentPlan" TEXT NOT NULL DEFAULT 'free'
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shop_key" ON "ShopSettings"("shop");
