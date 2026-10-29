import React from "react";
import { getCurrentMerchant } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoreUrls } from "@/lib/urls";
import { prisma } from "@/lib/prisma";
import { businessInitials } from "@/lib/inventory";
import { MoreMenuScreen } from "@/components/merchant/MoreMenuScreen";

export default async function MorePage() {
  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/login");
  }

  if (merchant.onboardingState !== "COMPLETED") {
    redirect("/onboarding");
  }

  const business = merchant.businessProfile;
  const slug = business?.slug || "shop";
  const urls = getStoreUrls(slug);

  const businessName = business?.businessName || "My Store";
  const initials = businessInitials(businessName);

  const pendingCount = await prisma.order.count({
    where: {
      merchantId: merchant.id,
      paymentStatus: "AWAITING_PAYMENT",
    },
  });

  return (
    <MoreMenuScreen
      businessName={businessName}
      storeSlug={slug}
      fullStoreUrl={urls.fullStore}
      merchantEmail={merchant.email}
      initials={initials}
      pendingBadgeCount={pendingCount}
    />
  );
}
