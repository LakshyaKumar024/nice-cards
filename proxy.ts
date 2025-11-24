// proxy.ts
import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/design/(.*)/checkout",
  "/edit/(.*)",
  "/my-templates"
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
  const url = new URL(req.url);

  if (
    url.pathname.includes('/upload') ||
    url.pathname.includes('/design/create') ||
    req.method === 'POST' && (
      url.pathname.includes('/image') ||
      url.pathname.includes('/pdf') ||
      url.pathname.includes('/file')
    )
  ) {
    return NextResponse.next();
  }

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

  // check developer routes
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
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};