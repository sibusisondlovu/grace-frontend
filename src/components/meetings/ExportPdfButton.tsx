import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ExportPdfButtonProps {
  documentId: string;
  documentTitle: string;
  documentContent: string;
  documentType: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

export function ExportPdfButton({ 
  documentId, 
  documentTitle, 
  documentContent,
  documentType,
  size = 'sm',
  variant = 'outline'
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      // Create a temporary container for rendering
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.style.padding = '20mm';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12pt';
      container.style.lineHeight = '1.6';
      container.style.color = '#000000';
      
      // Add header
      const header = document.createElement('div');
      header.style.marginBottom = '20px';
      header.style.borderBottom = '2px solid #333';
      header.style.paddingBottom = '10px';
      header.innerHTML = `
        <h1 style="margin: 0; font-size: 18pt; color: #000;">${documentTitle}</h1>
        <p style="margin: 5px 0 0 0; font-size: 10pt; color: #666;">
          ${documentType.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}
        </p>
      `;
      container.appendChild(header);
      
      // Add content
      const content = document.createElement('div');
      content.style.marginTop = '20px';
      content.innerHTML = documentContent
        .replace(/<[^>]*>/g, (match) => {
          // Keep basic formatting but ensure colors are print-friendly
          if (match.includes('style=')) {
            return match.replace(/color:[^;"]*/gi, 'color: #000000');
          }
          return match;
        });
      container.appendChild(content);
      
      document.body.appendChild(container);

      // Capture as canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const sanitizedTitle = documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Save PDF
      pdf.save(filename);
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExportPdf}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}

