import TemplatesClient from "./TemplateClient";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db-init";
import { redirect } from "next/navigation";

export default async function MyTemplatesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-up");

  const templates = await prisma.template.findMany({
    where: { savedTemplates: { some: { userId: user.id } }, status: true },
    orderBy: { createdAt: "desc" },
    select: {
      uuid: true,
      name: true,
      description: true,
      catogery: true,
      image: true,
      createdAt: true,
    },
  });

  return <TemplatesClient initialTemplates={templates} />;
}
