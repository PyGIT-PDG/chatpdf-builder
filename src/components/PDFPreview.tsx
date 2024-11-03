import type { ChatMessage } from '@/lib/types';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useEffect, useRef } from 'react';
import { format } from 'date-fns';

// Initialize pdfMake with the virtual file system
(window as any).pdfMake = pdfMake;
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

interface PDFPreviewProps {
  messages: ChatMessage[];
}

const PDFPreview = ({ messages }: PDFPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const docDefinition = {
      content: [
        { text: 'PDFGen', style: 'header' },
        { text: '\n' },
        ...messages.map((message) => ({
          stack: [
            {
              text: message.content,
              style: message.type === 'user' ? 'userMessage' : 'systemMessage',
            },
            {
              text: format(message.timestamp, 'HH:mm'),
              style: 'timestamp',
            },
          ],
          margin: [0, 0, 0, 10],
        })),
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        userMessage: {
          fontSize: 12,
          color: '#FFFFFF',
          background: '#2563eb',
          padding: 8,
          borderRadius: 5,
        },
        systemMessage: {
          fontSize: 12,
          color: '#000000',
          background: '#F8FAFC',
          padding: 8,
          borderRadius: 5,
        },
        timestamp: {
          fontSize: 8,
          color: '#6B7280',
          margin: [0, 4, 0, 0],
        },
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    pdfDocGenerator.getDataUrl((dataUrl) => {
      if (iframeRef.current) {
        iframeRef.current.src = dataUrl;
      }
    });
  }, [messages]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full dark:bg-gray-900 border-0"
      title="PDF Preview"
    />
  );
};

export default PDFPreview;