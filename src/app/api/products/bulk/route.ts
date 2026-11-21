import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide an array of products to import." },
        { status: 400 }
      );
    }

    if (products.length > 500) {
      return NextResponse.json(
        { success: false, error: "Maximum 500 products allowed per batch import." },
        { status: 400 }
      );
    }

    const createdList: any[] = [];
    const errors: { row: number; name: string; error: string }[] = [];

    // Process all products
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const rowNum = i + 1;

      const name = (p.name || "").trim();
      if (!name) {
        errors.push({ row: rowNum, name: "Unknown", error: "Product name is required." });
        continue;
      }

      const priceVal = parseFloat(String(p.priceNaira || p.price || 0));
      if (isNaN(priceVal) || priceVal <= 0) {
        errors.push({ row: rowNum, name, error: "Price must be a valid number greater than 0." });
        continue;
      }

      const priceKobo = BigInt(Math.round(priceVal * 100));

      let costKobo: bigint | null = null;
      if (p.costNaira !== undefined && p.costNaira !== null && p.costNaira !== "") {
        const costVal = parseFloat(String(p.costNaira));
        if (!isNaN(costVal) && costVal >= 0) {
          costKobo = BigInt(Math.round(costVal * 100));
        }
      }

      let stockOnHand = 0;
      if (p.stockQuantity !== undefined && p.stockQuantity !== null && p.stockQuantity !== "") {
        const sVal = parseInt(String(p.stockQuantity), 10);
        if (!isNaN(sVal) && sVal >= 0) {
          stockOnHand = sVal;
        }
      }

      const category = p.category ? String(p.category).trim() : null;
      const description = p.description ? String(p.description).trim() : null;
      const sku = p.sku ? String(p.sku).trim() : `SKU-${Date.now().toString().slice(-6)}-${i}`;

      const baseSlug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-") || "product";

      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}-${i}`;

      // Handle image URLs (can be array or comma-separated string)
      let parsedImages: { url: string; position: number }[] = [];
      if (Array.isArray(p.imageUrls)) {
        parsedImages = p.imageUrls
          .filter((u: any) => typeof u === "string" && u.trim().startsWith("http"))
          .map((u: string, idx: number) => ({ url: u.trim(), position: idx }));
      } else if (typeof p.imageUrls === "string" && p.imageUrls.trim()) {
        parsedImages = p.imageUrls
          .split(",")
          .map((u: string) => u.trim())
          .filter((u: string) => u.startsWith("http"))
          .map((u: string, idx: number) => ({ url: u, position: idx }));
      } else if (typeof p.photoUrl === "string" && p.photoUrl.trim().startsWith("http")) {
        parsedImages = [{ url: p.photoUrl.trim(), position: 0 }];
      }

      try {
        const created = await prisma.product.create({
          data: {
            merchantId: merchant.id,
            name,
            slug: uniqueSlug,
            description,
            sku,
            category,
            priceKobo,
            costKobo,
            trackStock: true,
            stockOnHand,
            status: "ACTIVE",
            images:
              parsedImages.length > 0
                ? {
                    create: parsedImages,
                  }
                : undefined,
          },
          include: {
            images: { orderBy: { position: "asc" } },
          },
        });

        // Create initial stock audit if stock > 0
        if (stockOnHand > 0) {
          await prisma.stockAudit.create({
            data: {
              productId: created.id,
              changeQty: stockOnHand,
              beforeAvailable: 0,
              afterAvailable: stockOnHand,
              beforeOnHand: 0,
              afterOnHand: stockOnHand,
              reason: "INITIAL_STOCK",
              note: "Bulk product import",
              actor: "Merchant",
            },
          }).catch(() => {});
        }

        createdList.push({
          ...created,
          priceKobo: created.priceKobo.toString(),
          costKobo: created.costKobo ? created.costKobo.toString() : null,
        });
      } catch (itemErr: any) {
        errors.push({
          row: rowNum,
          name,
          error: itemErr.message || "Failed to create product in database",
        });
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: createdList.length,
      failedCount: errors.length,
      createdProducts: createdList,
      errors,
    });
  } catch (error: any) {
    console.error("Bulk product upload failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process bulk upload." },
      { status: 500 }
    );
  }
}
