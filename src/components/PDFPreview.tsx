import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/lib/types';

// Initialize pdfMake with the virtual file system
(window as any).pdfMake = pdfMake;
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

interface PDFPreviewProps {
  messages: ChatMessage[];
  pdfContent?: any;
}

const PDFPreview = ({ pdfContent }: PDFPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!pdfContent) return;

    const pdfDocGenerator = pdfMake.createPdf(pdfContent);
    
    pdfDocGenerator.getDataUrl((dataUrl) => {
      if (iframeRef.current) {
        iframeRef.current.src = dataUrl;
      }
    });
  }, [pdfContent]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full dark:bg-gray-900 border-0"
      title="PDF Preview"
    />
  );
};

export default PDFPreview;