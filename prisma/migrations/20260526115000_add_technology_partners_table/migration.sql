-- CreateTable
CREATE TABLE "technology_partners" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "image_id" UUID NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "technology_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pivot_tech_partner_services" (
    "tech_partner_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pivot_tech_partner_services_pkey" PRIMARY KEY ("tech_partner_id","service_id")
);

-- CreateTable
CREATE TABLE "pivot_tech_partner_industries" (
    "tech_partner_id" UUID NOT NULL,
    "industry_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pivot_tech_partner_industries_pkey" PRIMARY KEY ("tech_partner_id","industry_id")
);

-- CreateIndex
CREATE INDEX "technology_partners_is_active_deleted_at_idx" ON "technology_partners"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "pivot_tech_partner_services_service_id_idx" ON "pivot_tech_partner_services"("service_id");

-- CreateIndex
CREATE INDEX "pivot_tech_partner_industries_industry_id_idx" ON "pivot_tech_partner_industries"("industry_id");

-- AddForeignKey
ALTER TABLE "technology_partners" ADD CONSTRAINT "technology_partners_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pivot_tech_partner_services" ADD CONSTRAINT "pivot_tech_partner_services_tech_partner_id_fkey" FOREIGN KEY ("tech_partner_id") REFERENCES "technology_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pivot_tech_partner_services" ADD CONSTRAINT "pivot_tech_partner_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pivot_tech_partner_industries" ADD CONSTRAINT "pivot_tech_partner_industries_tech_partner_id_fkey" FOREIGN KEY ("tech_partner_id") REFERENCES "technology_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pivot_tech_partner_industries" ADD CONSTRAINT "pivot_tech_partner_industries_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
