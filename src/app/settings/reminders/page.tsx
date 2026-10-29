import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AbandonedReminderSettings } from "@/components/orders/AbandonedReminderSettings";

export default async function ReminderSettingsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { merchantId: merchant.id },
    select: { businessName: true },
  });

  return <AbandonedReminderSettings businessName={profile?.businessName || "Your Store"} />;
}
