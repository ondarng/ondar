/**
 * Formats store and product URLs cleanly across Localhost and Production.
 *
 * In local development (localhost):
 * - Store URL:   `localhost:3000/s/[slug]`  (clickable immediately!)
 * - Product URL: `localhost:3000/s/[slug]/p/[productSlug]`
 *
 * In production (ondar.ng or custom domain):
 * - Store URL:   `[slug].ondar.ng` (or `[slug].[domain]`)
 * - Product URL: `[slug].ondar.ng/p/[productSlug]`
 */
export function getStoreUrls(slug: string, productSlug?: string) {
  const cleanSlug = slug || "shop";
  const cleanProductSlug = productSlug || "product";

  // Check if we are running in browser
  const isBrowser = typeof window !== "undefined";
  const host = isBrowser ? window.location.host : "localhost:3000";
  const protocol = isBrowser ? window.location.protocol : "http:";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  if (isLocalhost) {
    const displayStore = `${host}/s/${cleanSlug}`;
    const fullStore = `${protocol}//${displayStore}`;
    const displayProduct = `${host}/s/${cleanSlug}/p/${cleanProductSlug}`;
    const fullProduct = `${protocol}//${displayProduct}`;

    return {
      isLocalhost: true,
      displayStore,
      fullStore,
      displayProduct,
      fullProduct,
    };
  }

  // Production domain (e.g. ondar.ng)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || host.replace(/^[^.]+\./, "");
  const displayStore = `${cleanSlug}.${rootDomain}`;
  const fullStore = `https://${displayStore}`;
  const displayProduct = `${cleanSlug}.${rootDomain}/p/${cleanProductSlug}`;
  const fullProduct = `https://${displayProduct}`;

  return {
    isLocalhost: false,
    displayStore,
    fullStore,
    displayProduct,
    fullProduct,
  };
}
