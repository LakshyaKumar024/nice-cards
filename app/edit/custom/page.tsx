import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import CustomPdfEditClient from "./CustomPdfEditClient";

export const metadata: Metadata = {
  title: "Edit PDF",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditCustomPdfPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  return <CustomPdfEditClient userId={userId} />;
}

