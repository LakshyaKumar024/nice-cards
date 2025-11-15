import PDFEditor from '@/components/pdf-editor';

interface EditPDFPageProps {
  params: {
    pdfId: string;
  };
}

export default async function EditPDFPage({ params }: EditPDFPageProps) {
  // Await the params promise
  const { pdfId } = await params;
  
  return <PDFEditor pdfId={pdfId} />;
}