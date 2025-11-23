import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, FileText } from 'lucide-react';
import { useSiteVisits } from '@/hooks/useSiteVisits';
import { format } from 'date-fns';
import { NewSiteVisitDialog } from '@/components/site-visits/NewSiteVisitDialog';
import { UpdateSiteVisitDialog } from '@/components/site-visits/UpdateSiteVisitDialog';

export default function SiteVisits() {
  const { data: visits, isLoading } = useSiteVisits();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'planned':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Site Visits</h1>
            <p className="text-muted-foreground">
              Track oversight site visits and inspections
            </p>
          </div>
          <NewSiteVisitDialog />
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading site visits...</div>
        ) : (
          <div className="grid gap-4">
            {visits?.map((visit) => (
              <Card key={visit.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {visit.visit_number}: {visit.site_location}
                      </CardTitle>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{visit.committee?.name}</span>
                        <span>•</span>
                        <span>{format(new Date(visit.visit_date), 'PPP')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className={getStatusColor(visit.status)}>
                        {visit.status}
                      </Badge>
                      {visit.report_drafted && (
                        <Badge variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          Report Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {visit.site_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {visit.site_address}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-1">Visit Purpose:</p>
                    <p className="text-sm text-muted-foreground">
                      {visit.visit_purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {visit.participants.length} participant(s)
                    </span>
                  </div>

                  {visit.observations && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Observations:</p>
                      <p className="text-sm text-muted-foreground">
                        {visit.observations}
                      </p>
                    </div>
                  )}

                  {visit.findings && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Findings:</p>
                      <p className="text-sm text-muted-foreground">
                        {visit.findings}
                      </p>
                    </div>
                  )}

                  {visit.evidence_collected && visit.evidence_collected.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Evidence Collected:</p>
                      <div className="flex flex-wrap gap-2">
                        {visit.evidence_collected.map((evidence, idx) => (
                          <Badge key={idx} variant="secondary">
                            {evidence}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {visit.report_drafted && visit.report_text && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Report Summary:</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {visit.report_text}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4 flex justify-end">
                    <UpdateSiteVisitDialog visit={visit} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
