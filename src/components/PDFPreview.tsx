import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/lib/types';
import EditPlaceholderModal from './EditPlaceholderModal';
import { useToast } from './ui/use-toast';

// Initialize pdfMake with the virtual file system
(window as any).pdfMake = pdfMake;
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

interface PDFPreviewProps {
  messages?: ChatMessage[];
  pdfContent?: any;
}

const PDFPreview = ({ pdfContent }: PDFPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!pdfContent) return;
    setCurrentContent(pdfContent);
  }, [pdfContent]);

  useEffect(() => {
    if (!currentContent) return;

    const pdfDocGenerator = pdfMake.createPdf(currentContent);
    
    pdfDocGenerator.getDataUrl((dataUrl) => {
      if (iframeRef.current) {
        iframeRef.current.src = dataUrl;
      }
    });
  }, [currentContent]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDocument) return;

    // Add click event listener to the iframe document
    iframeDocument.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target || !target.textContent) return;

      // Check if clicked text contains [...] pattern
      const text = target.textContent;
      const placeholderMatch = text.match(/\[([^\]]+)\]/);
      
      if (placeholderMatch) {
        setSelectedPlaceholder(placeholderMatch[0]);
        setIsModalOpen(true);
      }
    });
  };

  const handleSavePlaceholder = (newValue: string) => {
    if (!currentContent) return;

    // Deep clone the current content
    const updatedContent = JSON.parse(JSON.stringify(currentContent));

    // Helper function to recursively update text in content
    const updateText = (obj: any) => {
      if (typeof obj === 'string') {
        return obj.replace(selectedPlaceholder, `[${newValue}]`);
      }
      if (Array.isArray(obj)) {
        return obj.map(item => updateText(item));
      }
      if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = updateText(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    const newContent = updateText(updatedContent);
    setCurrentContent(newContent);

    toast({
      title: "Updated Successfully",
      description: "The placeholder content has been updated.",
    });
  };

  return (
    <>
      <iframe
        ref={iframeRef}
        className="w-full h-full dark:bg-gray-900 border-0"
        title="PDF Preview"
        onLoad={handleIframeLoad}
      />
      <EditPlaceholderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlaceholder}
        placeholder={selectedPlaceholder}
      />
    </>
  );
};

export default PDFPreview;