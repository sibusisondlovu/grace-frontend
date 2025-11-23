import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DocumentSection {
  number?: string;
  title: string;
  content: string | string[];
}

export interface PdfTemplateOptions {
  title: string;
  subtitle?: string;
  committee: string;
  date: string;
  documentType: 'oversight_report' | 'minutes' | 'agenda' | 'report';
  sections: DocumentSection[];
  footer?: string;
}

export class CityOfJohannesburgPdfTemplate {
  private doc: jsPDF;
  private pageHeight: number = 297; // A4 height in mm
  private pageWidth: number = 210; // A4 width in mm
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 7;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  private addHeader(committee: string, date: string) {
    // Header line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 15, this.pageWidth - this.margin, 15);

    // Committee and date
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`City of Johannesburg Council ${date}`, this.margin, 12);
    
    this.currentY = 20;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`COJ : ${committee.toUpperCase()}`, this.margin, this.currentY);
    
    this.currentY += this.lineHeight;
    this.doc.text('COJ LEGISLATURE', this.margin, this.currentY);
    
    this.currentY += this.lineHeight * 2;
  }

  private addTitle(title: string) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    
    const splitTitle = this.doc.splitTextToSize(title.toUpperCase(), this.pageWidth - 2 * this.margin);
    splitTitle.forEach((line: string) => {
      if (this.currentY > this.pageHeight - this.margin) {
        this.addPage();
      }
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    this.currentY += this.lineHeight;
  }

  private addSection(section: DocumentSection) {
    if (this.currentY > this.pageHeight - this.margin - 20) {
      this.addPage();
    }

    // Section number and title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    const sectionHeader = section.number ? `${section.number} ${section.title.toUpperCase()}` : section.title.toUpperCase();
    this.doc.text(sectionHeader, this.margin, this.currentY);
    this.currentY += this.lineHeight * 1.5;

    // Section content
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const content = Array.isArray(section.content) ? section.content : [section.content];
    
    content.forEach((paragraph) => {
      if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
        // Bullet point
        const bullet = paragraph.startsWith('•') ? '•' : '-';
        const text = paragraph.substring(1).trim();
        const splitText = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin - 10);
        
        splitText.forEach((line: string, index: number) => {
          if (this.currentY > this.pageHeight - this.margin) {
            this.addPage();
          }
          if (index === 0) {
            this.doc.text(bullet, this.margin + 5, this.currentY);
            this.doc.text(line, this.margin + 10, this.currentY);
          } else {
            this.doc.text(line, this.margin + 10, this.currentY);
          }
          this.currentY += this.lineHeight;
        });
      } else {
        // Regular paragraph
        const splitText = this.doc.splitTextToSize(paragraph, this.pageWidth - 2 * this.margin);
        splitText.forEach((line: string) => {
          if (this.currentY > this.pageHeight - this.margin) {
            this.addPage();
          }
          this.doc.text(line, this.margin, this.currentY);
          this.currentY += this.lineHeight;
        });
      }
      this.currentY += 3; // Space between paragraphs
    });
    
    this.currentY += this.lineHeight;
  }

  private addPage() {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  private addFooter(pageNumber: number, totalPages: number, footerText?: string) {
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(100, 100, 100);
    
    if (footerText) {
      this.doc.text(footerText, this.margin, this.pageHeight - 10);
    }
    
    this.doc.text(`Page ${pageNumber} of ${totalPages}`, this.pageWidth - this.margin - 20, this.pageHeight - 10);
    this.doc.setTextColor(0, 0, 0);
  }

  public async generate(options: PdfTemplateOptions): Promise<Blob> {
    // Add header
    this.addHeader(options.committee, options.date);

    // Add title
    this.addTitle(options.title);

    // Add subtitle if provided
    if (options.subtitle) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'italic');
      const splitSubtitle = this.doc.splitTextToSize(options.subtitle, this.pageWidth - 2 * this.margin);
      splitSubtitle.forEach((line: string) => {
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      });
      this.currentY += this.lineHeight;
    }

    // Add sections
    options.sections.forEach(section => {
      this.addSection(section);
    });

    // Add footer to all pages
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.addFooter(i, totalPages, options.footer);
    }

    return this.doc.output('blob');
  }

  public download(filename: string) {
    this.doc.save(filename);
  }
}

export const generateCityPdf = async (options: PdfTemplateOptions, filename: string) => {
  const template = new CityOfJohannesburgPdfTemplate();
  await template.generate(options);
  template.download(filename);
};
