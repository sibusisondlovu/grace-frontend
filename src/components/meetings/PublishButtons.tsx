import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye } from "lucide-react";
import { usePublishDocument, usePublishMinutes } from "@/hooks/usePublishDocument";
import { usePublishAgenda } from "@/hooks/useAgendas";
import { ExportPdfButton } from "./ExportPdfButton";
import { ProfessionalExportButton } from "./ProfessionalExportButton";

interface PublishButtonsProps {
  type: 'agenda' | 'minutes' | 'document';
  id: string;
  published: boolean;
  meetingId?: string; // Required for agenda and minutes
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  showBadge?: boolean;
  documentTitle?: string;
  documentContent?: string;
  documentType?: string;
  meetingTitle?: string;
  committee?: string;
  meetingDate?: string;
  useProfessionalTemplate?: boolean;
}

export const PublishButtons = ({ 
  type, 
  id, 
  published, 
  meetingId, 
  disabled = false,
  size = 'sm',
  showBadge = true,
  documentTitle,
  documentContent,
  documentType,
  meetingTitle,
  committee,
  meetingDate,
  useProfessionalTemplate = false
}: PublishButtonsProps) => {
  const publishAgenda = usePublishAgenda();
  const publishMinutes = usePublishMinutes();
  const publishDocument = usePublishDocument();

  const getHook = () => {
    switch (type) {
      case 'agenda':
        return publishAgenda;
      case 'minutes':
        return publishMinutes;
      case 'document':
        return publishDocument;
      default:
        return publishDocument;
    }
  };

  const hook = getHook();

  const handleToggle = () => {
    if (type === 'agenda' && meetingId) {
      publishAgenda.mutate({ meetingId, published: !published });
    } else if (type === 'minutes' && meetingId) {
      publishMinutes.mutate({ meetingId, published: !published });
    } else if (type === 'document') {
      publishDocument.mutate({ documentId: id, published: !published });
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'agenda':
        return 'Agenda';
      case 'minutes':
        return 'Minutes';
      case 'document':
        return 'Document';
      default:
        return 'Item';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showBadge && (
        <Badge variant={published ? "default" : "secondary"}>
          {published ? 'Published' : 'Draft'}
        </Badge>
      )}
      {documentTitle && documentContent && documentType && (
        <>
          {useProfessionalTemplate && meetingTitle && committee && meetingDate ? (
            <ProfessionalExportButton
              meetingTitle={meetingTitle}
              committee={committee}
              meetingDate={meetingDate}
              documentType={documentType as any}
              content={documentContent}
              size={size}
            />
          ) : (
            <ExportPdfButton
              documentId={id}
              documentTitle={documentTitle}
              documentContent={documentContent}
              documentType={documentType}
              size={size}
            />
          )}
        </>
      )}
      <Button
        variant={published ? "destructive" : "default"}
        size={size}
        onClick={handleToggle}
        disabled={disabled || hook.isPending}
      >
        {published ? (
          <>
            <Eye className="h-4 w-4 mr-1" />
            Unpublish {getLabel()}
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Publish {getLabel()}
          </>
        )}
      </Button>
    </div>
  );
};