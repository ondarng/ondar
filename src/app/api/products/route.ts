import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    products: products.map((p) => ({
      ...p,
      priceKobo: p.priceKobo.toString(),
      costKobo: p.costKobo ? p.costKobo.toString() : null,
      sku: p.sku,
      category: p.category,
      lowStockThreshold: p.lowStockThreshold,
      variants: p.variants.map((v) => ({
        ...v,
        priceKobo: v.priceKobo ? v.priceKobo.toString() : null,
        costKobo: v.costKobo ? v.costKobo.toString() : null,
      })),
    })),
  });
}

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      priceNaira,
      stockQuantity,
      photoUrl,
      description,
      costPriceNaira,
      category,
      sku,
      lowStockThreshold,
      status,
      trackStock,
      extraImages,
      variants,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Product name is required." },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(priceNaira);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid price." },
        { status: 400 }
      );
    }

    const isTracked = trackStock !== undefined ? Boolean(trackStock) : true;
    let parsedStock = 0;
    if (isTracked) {
      parsedStock = parseInt(stockQuantity, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid stock quantity." },
          { status: 400 }
        );
      }
    }

    let costKobo: bigint | null = null;
    if (costPriceNaira !== undefined && costPriceNaira !== null && costPriceNaira !== "") {
      const parsedCost = parseFloat(costPriceNaira);
      if (!isNaN(parsedCost) && parsedCost >= 0) {
        costKobo = BigInt(Math.round(parsedCost * 100));
      }
    }

    let parsedThreshold: number | null = null;
    if (lowStockThreshold !== undefined && lowStockThreshold !== null && lowStockThreshold !== "") {
      const val = parseInt(lowStockThreshold, 10);
      if (!isNaN(val) && val >= 0) {
        parsedThreshold = val;
      }
    }

    const priceKobo = BigInt(Math.round(parsedPrice * 100));
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "product";

    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const productStatus = status === "DRAFT" ? "DRAFT" : "ACTIVE";

    // Variants handling
    const variantsToCreate = Array.isArray(variants)
      ? variants.map((v: any) => ({
          title: String(v.title || "").trim() || "Default",
          sku: v.sku ? String(v.sku).trim() : null,
          priceKobo: v.priceNaira ? BigInt(Math.round(parseFloat(v.priceNaira) * 100)) : null,
          costKobo: v.costNaira ? BigInt(Math.round(parseFloat(v.costNaira) * 100)) : null,
          stockOnHand: typeof v.stockOnHand === "number" ? v.stockOnHand : (parseInt(v.stockOnHand, 10) || 0),
          imageUrl: v.imageUrl || null,
          options: v.options || {},
        }))
      : [];

    if (variantsToCreate.length > 0) {
      parsedStock = variantsToCreate.reduce((acc, item) => acc + (item.stockOnHand || 0), 0);
    }

    // Combine main photo and any extra images
    const imagesToCreate: { url: string; position: number }[] = [];
    if (photoUrl) {
      imagesToCreate.push({ url: photoUrl, position: 0 });
    }
    if (Array.isArray(extraImages)) {
      extraImages.forEach((imgUrl: string, idx: number) => {
        if (imgUrl && typeof imgUrl === "string") {
          imagesToCreate.push({ url: imgUrl, position: imagesToCreate.length });
        }
      });
    }

    const product = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: name.trim(),
        slug: uniqueSlug,
        description: description?.trim() || null,
        sku: sku?.trim() || null,
        category: category?.trim() || null,
        priceKobo,
        costKobo,
        trackStock: isTracked,
        stockOnHand: parsedStock,
        lowStockThreshold: parsedThreshold,
        status: productStatus,
        images: imagesToCreate.length > 0
          ? {
              create: imagesToCreate,
            }
          : undefined,
        variants: variantsToCreate.length > 0
          ? {
              create: variantsToCreate,
            }
          : undefined,
      },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        priceKobo: product.priceKobo.toString(),
        costKobo: product.costKobo ? product.costKobo.toString() : null,
        variants: product.variants.map((v) => ({
          ...v,
          priceKobo: v.priceKobo ? v.priceKobo.toString() : null,
          costKobo: v.costKobo ? v.costKobo.toString() : null,
        })),
      },
    });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product." },
      { status: 500 }
    );
  }
}
