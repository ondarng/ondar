import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveTemplateId, STOREFRONT_TEMPLATES } from "@/lib/storefront-templates";
import {
  StorefrontCatalogClient,
  type CatalogProduct,
} from "@/components/storefront/customer/StorefrontCatalogClient";
import { ElectronicsCatalogClient } from "@/components/storefront/customer/ElectronicsCatalogClient";
import { FashionCatalogClient } from "@/components/storefront/customer/FashionCatalogClient";
import { FoodCatalogClient } from "@/components/storefront/customer/FoodCatalogClient";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    previewTemplate?: string;
  }>;
}

export default async function PublicStorefrontPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { previewTemplate } = await searchParams;

  const profile = await prisma.businessProfile.findUnique({
    where: { slug },
    include: {
      merchant: {
        include: {
          products: {
            where: { status: "ACTIVE" },
            include: {
              images: { orderBy: { position: "asc" } },
              variants: { orderBy: { createdAt: "asc" } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const rawProducts = profile.merchant.products;
  // Non-destructive preview: presentation-only, never persists to merchant profile
  const templateId = resolveTemplateId(profile.templateId, previewTemplate);
  const isPreviewing = Boolean(previewTemplate && previewTemplate in STOREFRONT_TEMPLATES);
  const activeTemplateConfig = STOREFRONT_TEMPLATES[templateId];

  const products: CatalogProduct[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceKobo: p.priceKobo.toString(),
    category: p.category,
    description: p.description,
    stockOnHand: p.stockOnHand,
    stockReserved: p.stockReserved,
    trackStock: p.trackStock,
    isOutOfStockManual: p.isOutOfStockManual,
    lowStockThreshold: p.lowStockThreshold,
    images: p.images.map((img) => ({ url: img.url })),
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      priceKobo: v.priceKobo ? v.priceKobo.toString() : null,
      stockOnHand: v.stockOnHand,
      stockReserved: v.stockReserved,
      options: v.options,
    })),
  }));

  const previewBanner = isPreviewing ? (
    <div className="sticky top-0 z-50 bg-neutral-900 text-white text-xs px-4 py-2 flex items-center justify-between border-b border-neutral-800 shadow-md">
      <div className="flex items-center gap-2">
        <Eye className="w-3.5 h-3.5 text-[#00A859]" />
        <span>
          Previewing <strong>{activeTemplateConfig.name}</strong> · Not saved
        </span>
      </div>
      <Link
        href={`/s/${slug}`}
        className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1"
      >
        <span>Exit preview</span>
        <X className="w-3.5 h-3.5" />
      </Link>
    </div>
  ) : null;

  return (
    <>
      {previewBanner}
      {templateId === "food" ? (
        <FoodCatalogClient
          businessName={profile.businessName}
          storeSlug={slug}
          description={profile.description}
          logoUrl={profile.logoUrl}
          city={profile.city}
          state={profile.state}
          whatsappNumber={profile.whatsappNumber}
          phoneNumber={profile.phoneNumber || undefined}
          returnPolicy={profile.returnPolicy}
          products={products}
          previewTemplate={previewTemplate}
        />
      ) : templateId === "fashion" ? (
        <FashionCatalogClient
          businessName={profile.businessName}
          storeSlug={slug}
          description={profile.description}
          logoUrl={profile.logoUrl}
          city={profile.city}
          state={profile.state}
          whatsappNumber={profile.whatsappNumber}
          phoneNumber={profile.phoneNumber || undefined}
          returnPolicy={profile.returnPolicy}
          products={products}
          previewTemplate={previewTemplate}
        />
      ) : templateId === "electronics" ? (
        <ElectronicsCatalogClient
          businessName={profile.businessName}
          storeSlug={slug}
          description={profile.description}
          logoUrl={profile.logoUrl}
          city={profile.city}
          state={profile.state}
          whatsappNumber={profile.whatsappNumber}
          phoneNumber={profile.phoneNumber || undefined}
          returnPolicy={profile.returnPolicy}
          products={products}
          previewTemplate={previewTemplate}
        />
      ) : (
        <StorefrontCatalogClient
          businessName={profile.businessName}
          storeSlug={slug}
          description={profile.description}
          logoUrl={profile.logoUrl}
          city={profile.city}
          state={profile.state}
          whatsappNumber={profile.whatsappNumber}
          phoneNumber={profile.phoneNumber || undefined}
          returnPolicy={profile.returnPolicy}
          deliveryCoverage={profile.deliveryCoverage}
          products={products}
          previewTemplate={previewTemplate}
        />
      )}
    </>
  );
}
