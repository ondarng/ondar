import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { getStoreUrls } from "@/lib/urls";
import { formatToWhatsappNumber } from "@/lib/phone";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const filter = searchParams.get("filter") || "all"; // "all" | "completed" | "in_progress" | "has_products" | "has_orders"

    // Fetch all merchants with related profiles, payouts, and counts
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        businessProfile: true,
        payoutAccount: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            priceKobo: true,
            stockOnHand: true,
            status: true,
          },
          take: 6,
          orderBy: { createdAt: "desc" },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalKobo: true,
            orderStatus: true,
            paymentStatus: true,
            paymentRoute: true,
            createdAt: true,
          },
          take: 6,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Compute platform summary metrics
    const totalMerchants = merchants.length;
    const completedOnboarding = merchants.filter(
      (m) => m.onboardingState === "COMPLETED" || (m.businessProfile?.slug && m.payoutAccount)
    ).length;

    let totalProductsCount = 0;
    let totalOrdersCount = 0;
    let totalPlatformRevenueKobo = BigInt(0);

    // Format merchant list with computed helpers
    const formattedMerchants = merchants.map((m) => {
      totalProductsCount += m._count.products;
      totalOrdersCount += m._count.orders;

      let merchantRevenueKobo = BigInt(0);
      m.orders.forEach((o) => {
        if (o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED" || o.orderStatus === "TO_FULFIL") {
          merchantRevenueKobo += o.totalKobo;
        }
      });
      totalPlatformRevenueKobo += merchantRevenueKobo;

      const slug = m.businessProfile?.slug || "";
      const urls = slug ? getStoreUrls(slug) : null;
      const rawPhone = m.businessProfile?.whatsappNumber || m.businessProfile?.phoneNumber || "";
      const waNumber = formatToWhatsappNumber(rawPhone);
      const waLink = waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
            `Hello ${m.businessProfile?.businessName || "there"}, this is Ondar Admin!`
          )}`
        : null;

      return {
        id: m.id,
        email: m.email,
        createdAt: m.createdAt.toISOString(),
        onboardingStep: m.onboardingStep,
        onboardingState: m.onboardingState,
        business: m.businessProfile
          ? {
              id: m.businessProfile.id,
              name: m.businessProfile.businessName,
              slug: m.businessProfile.slug,
              logoUrl: m.businessProfile.logoUrl,
              whatsappNumber: m.businessProfile.whatsappNumber,
              phoneNumber: m.businessProfile.phoneNumber,
              state: m.businessProfile.state,
              city: m.businessProfile.city,
              address: m.businessProfile.address,
              deliveryEnabled: m.businessProfile.deliveryEnabled,
              pickupEnabled: m.businessProfile.pickupEnabled,
              templateId: m.businessProfile.templateId,
              storeUrl: urls?.fullStore || `/s/${slug}`,
              relativeStoreUrl: `/s/${slug}`,
              whatsappLink: waLink,
            }
          : null,
        payout: m.payoutAccount
          ? {
              bankName: m.payoutAccount.bankName,
              bankCode: m.payoutAccount.bankCode,
              accountNumber: m.payoutAccount.accountNumber,
              accountName: m.payoutAccount.accountName,
              isVerified: m.payoutAccount.isVerified,
            }
          : null,
        stats: {
          productCount: m._count.products,
          orderCount: m._count.orders,
          revenueKobo: merchantRevenueKobo.toString(),
          revenueNaira: Math.round(Number(merchantRevenueKobo) / 100),
        },
        recentProducts: m.products.map((p) => ({
          id: p.id,
          name: p.name,
          priceNaira: Math.round(Number(p.priceKobo) / 100),
          stockOnHand: p.stockOnHand,
          status: p.status,
        })),
        recentOrders: m.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          totalNaira: Math.round(Number(o.totalKobo) / 100),
          orderStatus: o.orderStatus,
          paymentStatus: o.paymentStatus,
          paymentRoute: o.paymentRoute,
          createdAt: o.createdAt.toISOString(),
        })),
      };
    });

    // Apply filtering
    let filtered = formattedMerchants;

    if (search) {
      filtered = filtered.filter((m) => {
        const emailMatch = m.email.toLowerCase().includes(search);
        const nameMatch = m.business?.name?.toLowerCase().includes(search);
        const slugMatch = m.business?.slug?.toLowerCase().includes(search);
        const phoneMatch = m.business?.whatsappNumber?.includes(search) || m.business?.phoneNumber?.includes(search);
        const bankMatch = m.payout?.accountNumber?.includes(search) || m.payout?.accountName?.toLowerCase().includes(search);
        return emailMatch || nameMatch || slugMatch || phoneMatch || bankMatch;
      });
    }

    if (filter === "completed") {
      filtered = filtered.filter((m) => m.onboardingState === "COMPLETED");
    } else if (filter === "in_progress") {
      filtered = filtered.filter((m) => m.onboardingState !== "COMPLETED");
    } else if (filter === "has_products") {
      filtered = filtered.filter((m) => m.stats.productCount > 0);
    } else if (filter === "has_orders") {
      filtered = filtered.filter((m) => m.stats.orderCount > 0);
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalMerchants,
        completedOnboarding,
        inProgressOnboarding: totalMerchants - completedOnboarding,
        totalProducts: totalProductsCount,
        totalOrders: totalOrdersCount,
        totalRevenueKobo: totalPlatformRevenueKobo.toString(),
        totalRevenueNaira: Math.round(Number(totalPlatformRevenueKobo) / 100),
      },
      merchants: filtered,
    });
  } catch (err: any) {
    console.error("Admin merchants fetch error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load merchants" },
      { status: 500 }
    );
  }
}
