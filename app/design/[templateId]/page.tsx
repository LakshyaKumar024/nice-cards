// app/design/[templateId]/page.tsx
import { use } from "react";
import TemplateDetail from "@/components/templateDetail";

export default function Page({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);

  return <TemplateDetail templateId={templateId} />;
}
