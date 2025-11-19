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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedRoute(req)) await auth.protect()
  
  // check admin routes
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
  // Run middleware for pages and for API/trpc routes, but exclude the
  // upload endpoint which previously caused multipart body parsing issues.
  // This lets Clerk's middleware run (so `auth()` works) while avoiding
  // running middleware on the specific upload route that needs raw body access.
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)((?!/dashboard/design/create).*)",
  ],
};