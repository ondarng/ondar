import { NextRequest } from "next/server";
import { proxy, config } from "./proxy";

export function middleware(req: NextRequest) {
  return proxy(req);
}

export { config };
