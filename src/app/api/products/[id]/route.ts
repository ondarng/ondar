import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedProduct } from "@/lib/owned";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await getOwnedProduct(merchant.id, id);

  if (!product) {
    return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
  }

  try {
    const body = await req.json();

    if (body.action === "archive") {
      const updated = await prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" },
        include: { images: { orderBy: { position: "asc" } } },
      });
      return NextResponse.json({
        success: true,
        product: {
          ...updated,
          priceKobo: updated.priceKobo.toString(),
          costKobo: updated.costKobo ? updated.costKobo.toString() : null,
        },
      });
    }

    if (body.action === "adjust") {
      const delta = parseInt(body.delta, 10);
      if (isNaN(delta) || delta === 0) {
        return NextResponse.json(
          { success: false, error: "Please provide a non-zero adjustment delta." },
          { status: 400 }
        );
      }

      const beforeOnHand = product.stockOnHand;
      const beforeReserved = product.stockReserved;
      const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);
      const newOnHand = beforeOnHand + delta;

      if (newOnHand < beforeReserved) {
        return NextResponse.json(
          { success: false, error: "Stock cannot be reduced below currently reserved units." },
          { status: 400 }
        );
      }

      const afterAvailable = Math.max(0, newOnHand - beforeReserved);

      let auditReason: "MANUAL_RESTOCK" | "MANUAL_CORRECTION" = delta > 0 ? "MANUAL_RESTOCK" : "MANUAL_CORRECTION";
      if (body.reasonCode === "RETURN") auditReason = "MANUAL_RESTOCK";

      const [updated] = await prisma.$transaction([
        prisma.product.update({
          where: { id },
          data: { stockOnHand: newOnHand },
          include: {
            images: { orderBy: { position: "asc" } },
            variants: { orderBy: { createdAt: "asc" } },
          },
        }),
        prisma.stockAudit.create({
          data: {
            productId: id,
            changeQty: delta,
            beforeAvailable,
            afterAvailable,
            beforeOnHand,
            afterOnHand: newOnHand,
            beforeReserved,
            afterReserved: beforeReserved,
            reason: auditReason,
            referenceId: body.referenceId || "Merchant manual adjustment",
            note: body.note || (delta > 0 ? "Restock" : "Damaged / Correction"),
            actor: body.actor || "Merchant adjustment",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        product: {
          ...updated,
          priceKobo: updated.priceKobo.toString(),
          costKobo: updated.costKobo ? updated.costKobo.toString() : null,
          variants: updated.variants.map((v) => ({
            ...v,
            priceKobo: v.priceKobo ? v.priceKobo.toString() : null,
            costKobo: v.costKobo ? v.costKobo.toString() : null,
          })),
        },
      });
    }

    // General update
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.trackStock !== undefined) updateData.trackStock = Boolean(body.trackStock);
    if (body.isOutOfStockManual !== undefined) updateData.isOutOfStockManual = Boolean(body.isOutOfStockManual);
    if (body.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = body.lowStockThreshold === null ? null : parseInt(body.lowStockThreshold, 10);
    }
    if (body.priceNaira !== undefined) {
      const parsed = parseFloat(body.priceNaira);
      if (!isNaN(parsed) && parsed > 0) {
        updateData.priceKobo = BigInt(Math.round(parsed * 100));
      }
    }
    if (body.costPriceNaira !== undefined) {
      if (body.costPriceNaira === null || body.costPriceNaira === "") {
        updateData.costKobo = null;
      } else {
        const parsedCost = parseFloat(body.costPriceNaira);
        if (!isNaN(parsedCost) && parsedCost >= 0) {
          updateData.costKobo = BigInt(Math.round(parsedCost * 100));
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Photo update if provided
      if (body.photoUrl) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.create({
          data: {
            productId: id,
            url: body.photoUrl,
            position: 0,
          },
        });
      }

      // Variants update if provided
      if (body.variants !== undefined) {
        const incomingVariants = Array.isArray(body.variants) ? body.variants : [];
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        if (incomingVariants.length > 0) {
          await tx.productVariant.createMany({
            data: incomingVariants.map((v: any) => ({
              productId: id,
              title: String(v.title || "").trim() || "Default",
              sku: v.sku ? String(v.sku).trim() : null,
              priceKobo: v.priceNaira ? BigInt(Math.round(parseFloat(v.priceNaira) * 100)) : (v.priceKobo ? BigInt(v.priceKobo) : null),
              costKobo: v.costNaira ? BigInt(Math.round(parseFloat(v.costNaira) * 100)) : (v.costKobo ? BigInt(v.costKobo) : null),
              stockOnHand: typeof v.stockOnHand === "number" ? v.stockOnHand : (parseInt(v.stockOnHand, 10) || 0),
              stockReserved: typeof v.stockReserved === "number" ? v.stockReserved : (parseInt(v.stockReserved, 10) || 0),
              imageUrl: v.imageUrl || null,
              options: v.options || {},
            })),
          });

          const totalStock = incomingVariants.reduce((sum: number, v: any) => {
            const qty = typeof v.stockOnHand === "number" ? v.stockOnHand : (parseInt(v.stockOnHand, 10) || 0);
            return sum + qty;
          }, 0);

          updateData.stockOnHand = totalStock;
        }
      }

      return tx.product.update({
        where: { id },
        data: updateData,
        include: {
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: { createdAt: "asc" } },
        },
      });
    });

    return NextResponse.json({
      success: true,
      product: {
        ...updated,
        priceKobo: updated.priceKobo.toString(),
        costKobo: updated.costKobo ? updated.costKobo.toString() : null,
        variants: updated.variants.map((v) => ({
          ...v,
          priceKobo: v.priceKobo ? v.priceKobo.toString() : null,
          costKobo: v.costKobo ? v.costKobo.toString() : null,
        })),
      },
    });
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product." },
      { status: 500 }
    );
  }
}
