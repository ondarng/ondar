import React from "react";
import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PickupSettingsClient } from "@/components/shipping/PickupSettingsClient";

export default async function PickupSettingsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { merchantId: merchant.id },
  });

  return (
    <PickupSettingsClient
      businessName={profile?.businessName || "My Store"}
      initialPickupEnabled={profile?.pickupEnabled ?? false}
      address={profile?.address || "14 Aina Street"}
      city={profile?.city || "Ikeja"}
      state={profile?.state || "Lagos"}
      initialInstructions={
        profile?.pickupInstructions || "Call on arrival. Please have your order number ready."
      }
    />
  );
}
