import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
}

export default async function PublicStorefrontPage({ params }: Props) {
  const { slug } = await params;

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

  if (profile.templateId === "food") {
    return (
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
      />
    );
  }

  if (profile.templateId === "fashion") {
    return (
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
      />
    );
  }

  if (profile.templateId === "electronics") {
    return (
      <ElectronicsCatalogClient
        businessName={profile.businessName}
        storeSlug={slug}
        description={profile.description}
        logoUrl={profile.logoUrl}
        city={profile.city}
        state={profile.state}
        whatsappNumber={profile.whatsappNumber}
        phoneNumber={profile.phoneNumber || undefined}
        products={products}
      />
    );
  }

  return (
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
    />
  );
}
