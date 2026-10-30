import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TemplateSelectorClient } from "@/components/storefront/TemplateSelectorClient";

export default async function TemplatesPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { merchantId: merchant.id },
    select: {
      templateId: true,
      slug: true,
      businessName: true,
      description: true,
      logoUrl: true,
      city: true,
      state: true,
    },
  });

  return (
    <TemplateSelectorClient
      currentTemplateId={profile?.templateId || "default"}
      storeSlug={profile?.slug || "shop"}
      businessName={profile?.businessName || "My Store"}
      description={profile?.description}
      logoUrl={profile?.logoUrl}
      city={profile?.city}
      state={profile?.state}
    />
  );
}
