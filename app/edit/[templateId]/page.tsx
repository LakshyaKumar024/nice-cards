import PDFEditor from "@/components/pdf-editor";

interface EditPDFPageProps {
  params: {
    templateId: string;
  };
}

export default async function EditPDFPage({ params }: EditPDFPageProps) {
  // Await the params promise
  const { templateId } = await params;

  return <PDFEditor pdfId={templateId} />;
}
