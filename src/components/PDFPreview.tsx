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

  // Function to process content and make placeholders clickable
  const processContent = (content: any): any => {
    if (typeof content === 'string') {
      const placeholderRegex = /\[([^\]]+)\]/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = placeholderRegex.exec(content)) !== null) {
        // Add text before the placeholder
        if (match.index > lastIndex) {
          parts.push({ text: content.slice(lastIndex, match.index) });
        }

        // Add the placeholder as a clickable link
        parts.push({
          text: match[0],
          color: 'blue',
          decoration: 'underline',
          link: `placeholder:${match[0]}`,
          preserveLeadingSpaces: true
        });

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text after last placeholder
      if (lastIndex < content.length) {
        parts.push({ text: content.slice(lastIndex) });
      }

      return parts.length > 1 ? parts : content;
    }

    if (Array.isArray(content)) {
      return content.map(item => processContent(item));
    }

    if (typeof content === 'object' && content !== null) {
      const processed: any = {};
      for (const key in content) {
        processed[key] = processContent(content[key]);
      }
      return processed;
    }

    return content;
  };

  useEffect(() => {
    if (!pdfContent) return;
    const processedContent = processContent(pdfContent);
    setCurrentContent(processedContent);
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

    iframeDocument.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const closestLink = target.closest('a');
      
      if (closestLink && closestLink.href) {
        e.preventDefault();
        const placeholder = closestLink.href.split('placeholder:')[1];
        if (placeholder) {
          setSelectedPlaceholder(decodeURIComponent(placeholder));
          setIsModalOpen(true);
        }
      }
    });
  };

  const handleSavePlaceholder = (newValue: string) => {
    if (!currentContent) return;

    const updatedContent = JSON.parse(JSON.stringify(currentContent));
    const updateText = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => updateText(item));
      }
      if (typeof obj === 'object' && obj !== null) {
        if (obj.text === selectedPlaceholder && obj.link?.startsWith('placeholder:')) {
          return {
            text: `[${newValue}]`,
            color: 'blue',
            decoration: 'underline',
            link: `placeholder:[${newValue}]`,
            preserveLeadingSpaces: true
          };
        }
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = updateText(obj[key]);
        }
        return newObj;
      }
      if (typeof obj === 'string') {
        return obj.replace(selectedPlaceholder, `[${newValue}]`);
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