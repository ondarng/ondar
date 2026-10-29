import { prisma } from "@/lib/prisma";

/** Tenant-scoped lookup helpers. Never mutate a resource fetched by id alone. */
export function getOwnedProduct(merchantId: string, id: string) {
  return prisma.product.findFirst({ where: { id, merchantId } });
}

export function getOwnedOrder(merchantId: string, id: string) {
  return prisma.order.findFirst({ where: { id, merchantId } });
}

export function getOwnedCustomer(merchantId: string, id: string) {
  return prisma.customer.findFirst({ where: { id, merchantId } });
}

export function getOwnedCustomCheckoutLink(merchantId: string, id: string) {
  return prisma.customCheckoutLink.findFirst({ where: { id, merchantId } });
}
