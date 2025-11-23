import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare } from 'lucide-react';
import { useWardSubmissions } from '@/hooks/useWardSubmissions';
import { format } from 'date-fns';

export default function WardSubmissions() {
  const { data: submissions, isLoading } = useWardSubmissions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'addressed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'received':
        return 'bg-yellow-500';
      case 'escalated':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ward Submissions</h1>
            <p className="text-muted-foreground">
              Community submissions from ward committees
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Submission
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading ward submissions...</div>
        ) : (
          <div className="grid gap-4">
            {submissions?.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {submission.submission_number}: {submission.topic}
                      </CardTitle>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>Type: {submission.submission_type}</span>
                        <span>•</span>
                        <span>Ward {submission.ward_number}</span>
                        <span>•</span>
                        <span>{format(new Date(submission.date_submitted), 'PPP')}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.description}
                    </p>
                  </div>

                  {submission.submitter_details && (
                    <div>
                      <p className="text-sm font-medium mb-1">Submitter Details:</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.submitter_details}
                      </p>
                    </div>
                  )}

                  {submission.committee && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Linked to: {submission.committee.name}
                      </Badge>
                    </div>
                  )}

                  {submission.feedback_text && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-medium">Feedback Provided:</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {submission.feedback_text}
                      </p>
                      {submission.feedback_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Provided on: {format(new Date(submission.feedback_date), 'PPP')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
