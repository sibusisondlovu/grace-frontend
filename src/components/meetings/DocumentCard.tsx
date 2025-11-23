import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { ExportPdfButton } from "./ExportPdfButton";
import { PublishButtons } from "./PublishButtons";

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    content?: string;
    file_path?: string;
    published: boolean;
    document_type: string;
    created_at: string;
  };
  showPublishControls?: boolean;
  meetingId?: string;
  onDownload?: () => void;
  onPreview?: () => void;
}

export function DocumentCard({ 
  document, 
  showPublishControls = false,
  meetingId,
  onDownload,
  onPreview
}: DocumentCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium">{document.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Created {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {document.content && onPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
            {document.file_path && onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {document.content && (
              <ExportPdfButton
                documentId={document.id}
                documentTitle={document.title}
                documentContent={document.content}
                documentType={document.document_type}
                size="sm"
              />
            )}
            {showPublishControls && meetingId && (
              <PublishButtons
                type="document"
                id={document.id}
                published={document.published}
                meetingId={meetingId}
                size="sm"
                showBadge={false}
                documentTitle={document.title}
                documentContent={document.content || ''}
                documentType={document.document_type}
              />
            )}
          </div>
        </div>
        {document.content && (
          <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {document.content.substring(0, 150)}...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
