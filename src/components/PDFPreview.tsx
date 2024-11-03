import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/lib/types';
import EditPlaceholderModal from './EditPlaceholderModal';
import { useToast } from './ui/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();

  const processContent = (content: any): any => {
    if (typeof content === 'string') {
      const placeholderRegex = /\[([^\]]+)\]/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = placeholderRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ text: content.slice(lastIndex, match.index) });
        }

        const encodedPlaceholder = encodeURIComponent(match[0]);
        parts.push({
          text: match[0],
          color: 'blue',
          decoration: 'underline',
          link: `${window.location.pathname}?placeholder=${encodedPlaceholder}`,
          preserveLeadingSpaces: true
        });

        lastIndex = match.index + match[0].length;
      }

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
    const searchParams = new URLSearchParams(location.search);
    const placeholder = searchParams.get('placeholder');
    
    if (placeholder) {
      setSelectedPlaceholder(decodeURIComponent(placeholder));
      setIsModalOpen(true);
      // Clear the URL parameter after opening the modal
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (!currentContent) return;
    
    const pdfDocGenerator = pdfMake.createPdf({
      ...currentContent,
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
    });

    pdfDocGenerator.getDataUrl((dataUrl) => {
      if (iframeRef.current) {
        iframeRef.current.src = dataUrl;
      }
    });
  }, [currentContent]);

  const handleSavePlaceholder = (newValue: string) => {
    if (!currentContent) return;

    const updatedContent = JSON.parse(JSON.stringify(currentContent));
    const updateText = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => updateText(item));
      }
      if (typeof obj === 'object' && obj !== null) {
        if (obj.text === selectedPlaceholder && obj.link) {
          const encodedNewValue = encodeURIComponent(`[${newValue}]`);
          return {
            text: `[${newValue}]`,
            color: 'blue',
            decoration: 'underline',
            link: `${window.location.pathname}?placeholder=${encodedNewValue}`,
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