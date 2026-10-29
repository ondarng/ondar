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
    select: { templateId: true, slug: true },
  });

  return (
    <TemplateSelectorClient
      currentTemplateId={profile?.templateId || "default"}
      storeSlug={profile?.slug || "shop"}
    />
  );
}
