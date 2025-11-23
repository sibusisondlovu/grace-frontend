import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { usePetitions } from '@/hooks/usePetitions';
import { format } from 'date-fns';

export default function Petitions() {
  const { data: petitions, isLoading } = usePetitions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded':
        return 'bg-green-500';
      case 'under_review':
        return 'bg-blue-500';
      case 'received':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Petitions</h1>
            <p className="text-muted-foreground">
              Manage public petitions and submissions
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Petition
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading petitions...</div>
        ) : (
          <div className="grid gap-4">
            {petitions?.map((petition) => (
              <Card key={petition.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {petition.petition_number}: {petition.subject}
                      </CardTitle>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>Type: {petition.petition_type}</span>
                        <span>•</span>
                        <span>Classification: {petition.classification}</span>
                        <span>•</span>
                        <span>From: {petition.submitter_name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className={getStatusColor(petition.status)}>
                        {petition.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{petition.signatures_count} signatures</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Petition:</p>
                    <p className="text-sm text-muted-foreground">
                      {petition.petition_text}
                    </p>
                  </div>

                  {petition.routed_to_committee_id && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Routed to: {petition.committee?.name || petition.routed_to_dept}
                      </Badge>
                    </div>
                  )}

                  {petition.response_text && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Response:</p>
                      <p className="text-sm text-muted-foreground">
                        {petition.response_text}
                      </p>
                      {petition.response_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on: {format(new Date(petition.response_date), 'PPP')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>
                      Received: {format(new Date(petition.date_received), 'PPP')}
                    </span>
                    <Badge variant="secondary">
                      {petition.publication_status}
                    </Badge>
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
