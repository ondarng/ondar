import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveTemplateId, STOREFRONT_TEMPLATES } from "@/lib/storefront-templates";
import { StorefrontProductClient } from "@/components/storefront/customer/StorefrontProductClient";
import { FashionProductClient } from "@/components/storefront/customer/FashionProductClient";
import { FoodProductClient } from "@/components/storefront/customer/FoodProductClient";
import { ElectronicsProductClient } from "@/components/storefront/customer/ElectronicsProductClient";

interface Props {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
  searchParams: Promise<{
    previewTemplate?: string;
  }>;
}

export default async function PublicProductPage({ params, searchParams }: Props) {
  const { slug, productSlug } = await params;
  const { previewTemplate } = await searchParams;

  const profile = await prisma.businessProfile.findUnique({
    where: { slug },
  });

  if (!profile) {
    notFound();
  }

  const rawProduct = await prisma.product.findFirst({
    where: {
      merchantId: profile.merchantId,
      slug: productSlug,
      status: "ACTIVE",
    },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!rawProduct) {
    notFound();
  }

  const product = {
    id: rawProduct.id,
    name: rawProduct.name,
    slug: rawProduct.slug,
    priceKobo: rawProduct.priceKobo.toString(),
    category: rawProduct.category,
    description: rawProduct.description,
    stockOnHand: rawProduct.stockOnHand,
    stockReserved: rawProduct.stockReserved,
    trackStock: rawProduct.trackStock,
    isOutOfStockManual: rawProduct.isOutOfStockManual,
    lowStockThreshold: rawProduct.lowStockThreshold,
    images: rawProduct.images.map((img) => ({ url: img.url })),
    variants: rawProduct.variants.map((v) => ({
      id: v.id,
      title: v.title,
      priceKobo: v.priceKobo ? v.priceKobo.toString() : null,
      stockOnHand: v.stockOnHand,
      stockReserved: v.stockReserved,
      options: v.options,
    })),
  };

  const templateId = resolveTemplateId(profile.templateId, previewTemplate);
  const isPreviewing = Boolean(previewTemplate && previewTemplate in STOREFRONT_TEMPLATES);
  const activeTemplateConfig = STOREFRONT_TEMPLATES[templateId];

  const previewBanner = isPreviewing ? (
    <div className="sticky top-0 z-50 bg-neutral-900 text-white text-xs px-4 py-2 flex items-center justify-between border-b border-neutral-800 shadow-md">
      <div className="flex items-center gap-2">
        <Eye className="w-3.5 h-3.5 text-[#00A859]" />
        <span>
          Previewing <strong>{activeTemplateConfig.name}</strong> · Not saved
        </span>
      </div>
      <Link
        href={`/s/${slug}/p/${productSlug}`}
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
        <FoodProductClient
          businessName={profile.businessName}
          storeSlug={slug}
          city={profile.city}
          state={profile.state}
          tagline={profile.description}
          whatsappNumber={profile.whatsappNumber}
          phoneNumber={profile.phoneNumber || undefined}
          returnPolicy={profile.returnPolicy}
          product={product}
          previewTemplate={previewTemplate}
        />
      ) : templateId === "fashion" ? (
        <FashionProductClient
          businessName={profile.businessName}
          storeSlug={slug}
          city={profile.city}
          state={profile.state}
          tagline={profile.description}
          whatsappNumber={profile.whatsappNumber}
          phoneNumber={profile.phoneNumber || undefined}
          returnPolicy={profile.returnPolicy}
          product={product}
          previewTemplate={previewTemplate}
        />
      ) : templateId === "electronics" ? (
        <ElectronicsProductClient
          businessName={profile.businessName}
          storeSlug={slug}
          city={profile.city}
          state={profile.state}
          tagline={profile.description}
          whatsappNumber={profile.whatsappNumber}
          phoneNumber={profile.phoneNumber || undefined}
          returnPolicy={profile.returnPolicy}
          product={product}
          previewTemplate={previewTemplate}
        />
      ) : (
        <StorefrontProductClient
          businessName={profile.businessName}
          storeSlug={slug}
          city={profile.city}
          state={profile.state}
          tagline={profile.description}
          whatsappNumber={profile.whatsappNumber}
          phoneNumber={profile.phoneNumber || undefined}
          returnPolicy={profile.returnPolicy}
          product={product}
          previewTemplate={previewTemplate}
        />
      )}
    </>
  );
}
