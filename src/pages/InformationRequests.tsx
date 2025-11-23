import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { useInformationRequests } from '@/hooks/useInformationRequests';
import { format, isPast } from 'date-fns';
import { NewRequestDialog } from '@/components/information-requests/NewRequestDialog';

export default function InformationRequests() {
  const { data: requests, isLoading } = useInformationRequests();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complied':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Information Requests & Summons</h1>
            <p className="text-muted-foreground">
              Track requests for information and compliance
            </p>
          </div>
          <NewRequestDialog />
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading requests...</div>
        ) : (
          <div className="grid gap-4">
            {requests?.map((request) => {
              const isOverdue = isPast(new Date(request.deadline_date)) && 
                               request.compliance_status === 'pending';

              return (
                <Card key={request.id} className={isOverdue ? 'border-red-500' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {request.request_number}: {request.subject}
                        </CardTitle>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>Type: {request.request_type}</span>
                          <span>•</span>
                          <span>To: {request.addressed_to}</span>
                          {request.addressed_to_dept && (
                            <>
                              <span>•</span>
                              <span>Dept: {request.addressed_to_dept}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(request.compliance_status)}>
                          {request.compliance_status}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Request Details:</p>
                      <p className="text-sm text-muted-foreground">
                        {request.request_details}
                      </p>
                    </div>

                    {request.response_summary && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-1">Response Summary:</p>
                        <p className="text-sm text-muted-foreground">
                          {request.response_summary}
                        </p>
                        {request.response_received_date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Received: {format(new Date(request.response_received_date), 'PPP')}
                          </p>
                        )}
                      </div>
                    )}

                    {request.escalation_notes && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-1 text-orange-500">
                          Escalation Notes:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.escalation_notes}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Issue Date:</span>
                        <p className="font-medium">
                          {format(new Date(request.issue_date), 'PPP')}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deadline:</span>
                        <p className={`font-medium ${isOverdue ? 'text-red-500' : ''}`}>
                          {format(new Date(request.deadline_date), 'PPP')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
