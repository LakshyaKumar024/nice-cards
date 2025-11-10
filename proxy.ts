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

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (isProtectedRoute(req)) await auth.protect()
  console.log(isAdminRoute(req));

  if (isAdminRoute(req)) {

    if (!userId) {
      return await auth.protect()
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    console.log(user.publicMetadata);

    if (String(user.publicMetadata.role).toLowerCase() === 'admin') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));

  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
