// middleware.ts
import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/design/(.*)/checkout",
  "/design/(.*)/edit",
]);

const isAdminRoute = createRouteMatcher([
  "/dashboard(.*)?",
]);
const isDeveloperRoute = createRouteMatcher([
  "/developer(.*)?",
]);

//@ts-ignore
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedRoute(req)) await auth.protect()
  // check admin routs
  if (isAdminRoute(req)) {
    if (!userId) {
      return await auth.protect()
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (String(user.publicMetadata.role).toLowerCase() === 'admin') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // check developer routs
  if (isDeveloperRoute(req)) {
    if (!userId) {
      return await auth.protect()
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (user.publicMetadata.developer === true) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};