import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StorefrontProductClient } from "@/components/storefront/customer/StorefrontProductClient";
import { FashionProductClient } from "@/components/storefront/customer/FashionProductClient";
import { FoodProductClient } from "@/components/storefront/customer/FoodProductClient";

interface Props {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

export default async function PublicProductPage({ params }: Props) {
  const { slug, productSlug } = await params;

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

  if (profile.templateId === "food") {
    return (
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
      />
    );
  }

  if (profile.templateId === "fashion") {
    return (
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
      />
    );
  }

  return (
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
    />
  );
}
