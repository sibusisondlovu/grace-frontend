import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateCityPdf, DocumentSection } from './templates/PdfTemplate';
import { format } from 'date-fns';

interface ProfessionalExportButtonProps {
  meetingTitle: string;
  committee: string;
  meetingDate: string;
  documentType: 'oversight_report' | 'minutes' | 'agenda' | 'report';
  content: string;
  additionalSections?: DocumentSection[];
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

export function ProfessionalExportButton({ 
  meetingTitle,
  committee,
  meetingDate,
  documentType,
  content,
  additionalSections = [],
  size = 'sm',
  variant = 'outline'
}: ProfessionalExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const parseContentToSections = (htmlContent: string): DocumentSection[] => {
    const sections: DocumentSection[] = [];
    
    // Remove HTML tags but preserve structure
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Split by common section markers
    const lines = textContent.split('\n').filter(line => line.trim());
    
    let currentSection: DocumentSection | null = null;
    let currentContent: string[] = [];
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Check if it's a section header (starts with number or is all caps)
      const sectionMatch = trimmedLine.match(/^(\d+\.?\s+)?([A-Z\s]+)$/);
      
      if (sectionMatch && trimmedLine.length > 3) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n\n');
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          number: sectionMatch[1]?.trim(),
          title: sectionMatch[2].trim(),
          content: []
        };
        currentContent = [];
      } else if (currentSection && trimmedLine) {
        currentContent.push(trimmedLine);
      }
    });
    
    // Add last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n\n');
      sections.push(currentSection);
    }
    
    // If no sections were found, create a single content section
    if (sections.length === 0) {
      sections.push({
        title: 'CONTENT',
        content: textContent
      });
    }
    
    return sections;
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const contentSections = parseContentToSections(content);
      const allSections = [...contentSections, ...additionalSections];
      
      const documentTitle = (() => {
        switch (documentType) {
          case 'oversight_report':
            return `OVERSIGHT REPORT: ${meetingTitle}`;
          case 'minutes':
            return `MEETING MINUTES: ${meetingTitle}`;
          case 'agenda':
            return `MEETING AGENDA: ${meetingTitle}`;
          case 'report':
            return meetingTitle;
          default:
            return meetingTitle;
        }
      })();

      await generateCityPdf(
        {
          title: documentTitle,
          committee: committee,
          date: format(new Date(meetingDate), 'yyyy-MM-dd'),
          documentType: documentType,
          sections: allSections,
          footer: `Generated: ${format(new Date(), 'PPP')} | City of Johannesburg`
        },
        `${meetingTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`
      );
      
      toast.success('Professional PDF exported successfully');
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
          Export Professional PDF
        </>
      )}
    </Button>
  );
}
