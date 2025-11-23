import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertCircle, DollarSign } from 'lucide-react';
import { usePaiaRequests } from '@/hooks/usePaiaRequests';
import { format, isPast } from 'date-fns';

export default function PaiaRequests() {
  const { data: requests, isLoading } = usePaiaRequests();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'bg-green-500';
      case 'refused':
        return 'bg-red-500';
      case 'partially_granted':
        return 'bg-yellow-500';
      case 'received':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">PAIA Requests</h1>
            <p className="text-muted-foreground">
              Promotion of Access to Information Act requests
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New PAIA Request
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading PAIA requests...</div>
        ) : (
          <div className="grid gap-4">
            {requests?.map((request) => {
              const deadline = request.extended_deadline || request.statutory_deadline;
              const isOverdue = isPast(new Date(deadline)) && 
                               request.status === 'received';

              return (
                <Card key={request.id} className={isOverdue ? 'border-red-500' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {request.request_number}: {request.requester_name}
                        </CardTitle>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>Access: {request.form_of_access}</span>
                          <span>•</span>
                          <span>{request.requester_contact}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Overdue
                          </Badge>
                        )}
                        {request.appeal_lodged && (
                          <Badge variant="outline" className="text-orange-500">
                            Appeal Lodged
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Record Description:</p>
                      <p className="text-sm text-muted-foreground">
                        {request.record_description}
                      </p>
                    </div>

                    {request.decision && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium mb-1">Decision:</p>
                            <p className="text-sm text-muted-foreground">
                              {request.decision}
                            </p>
                            {request.refusal_grounds && (
                              <p className="text-xs text-red-500 mt-2">
                                Grounds: {request.refusal_grounds}
                              </p>
                            )}
                          </div>
                          {request.decision_date && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(request.decision_date), 'PPP')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {request.fees_prescribed && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span>Fees: R{request.fees_prescribed.toFixed(2)}</span>
                        <Badge variant={request.fees_paid ? 'default' : 'secondary'} className={request.fees_paid ? 'bg-green-500' : ''}>
                          {request.fees_paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                    )}

                    {request.release_package_ref && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Release Package: </span>
                        <span className="font-mono">{request.release_package_ref}</span>
                      </div>
                    )}

                    {request.appeal_notes && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-1 text-orange-500">
                          Appeal Notes:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.appeal_notes}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
                      <div>
                        <span className="text-muted-foreground">Received:</span>
                        <p className="font-medium">
                          {format(new Date(request.date_received), 'PPP')}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deadline:</span>
                        <p className={`font-medium ${isOverdue ? 'text-red-500' : ''}`}>
                          {format(new Date(deadline), 'PPP')}
                        </p>
                      </div>
                      {request.extension_granted && (
                        <div>
                          <Badge variant="outline">Extension Granted</Badge>
                        </div>
                      )}
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
