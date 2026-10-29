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
export function getStoreUrls(
  slug: string,
  productSlug?: string,
  serverHost?: string,
  serverProto?: string
) {
  const cleanSlug = slug || "shop";
  const cleanProductSlug = productSlug || "product";

  // Check if we are running in browser or given server host
  const isBrowser = typeof window !== "undefined";
  const rawHost =
    serverHost ||
    (isBrowser
      ? window.location.host
      : process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
      : "localhost:3000");

  const host = rawHost.replace(/:\d+$/, (match) =>
    match === ":80" || match === ":443" ? "" : match
  );

  const protocol = serverProto
    ? serverProto.endsWith(":")
      ? serverProto
      : `${serverProto}:`
    : isBrowser
    ? window.location.protocol
    : host.includes("localhost") || host.includes("127.0.0.1")
    ? "http:"
    : "https:";

  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  const isStaging = host.includes("vercel.app") || host.includes("netlify.app");

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ondar.ng";
  // Only use subdomain routing if explicitly on the real root domain (e.g. ondar.ng), not localhost or staging
  const supportsSubdomains =
    !isLocalhost && !isStaging && (host === rootDomain || host.endsWith(`.${rootDomain}`));

  if (!supportsSubdomains) {
    const displayStore = `${host}/s/${cleanSlug}`;
    const fullStore = `${protocol}//${displayStore}`;
    const displayProduct = `${host}/s/${cleanSlug}/p/${cleanProductSlug}`;
    const fullProduct = `${protocol}//${displayProduct}`;

    return {
      isLocalhost: isLocalhost || isStaging,
      displayStore,
      fullStore,
      displayProduct,
      fullProduct,
    };
  }

  // Production root domain (e.g. ondar.ng)
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
