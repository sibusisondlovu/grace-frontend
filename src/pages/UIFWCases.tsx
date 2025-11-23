import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, FileText, Calendar } from 'lucide-react';
import { useUIFWCases } from '@/hooks/useUIFWCases';
import { format } from 'date-fns';
import { NewCaseDialog } from '@/components/uifw/NewCaseDialog';

export default function UIFWCases() {
  const { data: cases, isLoading } = useUIFWCases();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return 'bg-green-500';
      case 'under_investigation':
        return 'bg-blue-500';
      case 'open':
        return 'bg-yellow-500';
      case 'hearing_scheduled':
        return 'bg-orange-500';
      case 'pending_council_decision':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCaseTypeColor = (type: string) => {
    switch (type) {
      case 'unauthorized':
        return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'irregular':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      case 'fruitless':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'wasteful':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">UIFW Cases</h1>
            <p className="text-muted-foreground">
              Unauthorized, Irregular, Fruitless & Wasteful Expenditure
            </p>
          </div>
          <NewCaseDialog />
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading UIFW cases...</div>
        ) : (
          <div className="grid gap-4">
            {cases?.map((uifwCase) => (
              <Card key={uifwCase.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        {uifwCase.case_number}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getCaseTypeColor(uifwCase.case_type)}>
                          {uifwCase.case_type}
                        </Badge>
                        <Badge variant="outline">
                          FY {uifwCase.financial_year}
                        </Badge>
                        <Badge variant="outline">
                          {uifwCase.department}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={getStatusColor(uifwCase.status)}>
                      {uifwCase.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-sm text-muted-foreground">
                      {uifwCase.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Amount:</p>
                      <p className="text-lg font-bold text-destructive">
                        {formatCurrency(uifwCase.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Date Opened:</p>
                      <p className="text-muted-foreground">
                        {format(new Date(uifwCase.date_opened), 'PPP')}
                      </p>
                    </div>
                  </div>

                  {uifwCase.evidence_summary && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Evidence Summary:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {uifwCase.evidence_summary}
                      </p>
                    </div>
                  )}

                  {uifwCase.findings && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Findings:</p>
                      <p className="text-sm text-muted-foreground">
                        {uifwCase.findings}
                      </p>
                    </div>
                  )}

                  {uifwCase.recommendations && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Recommendations:</p>
                      <p className="text-sm text-muted-foreground">
                        {uifwCase.recommendations}
                      </p>
                    </div>
                  )}

                  {uifwCase.hearing_date && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">Hearing Scheduled:</span>
                        <span className="text-muted-foreground">
                          {format(new Date(uifwCase.hearing_date), 'PPP')}
                        </span>
                      </div>
                    </div>
                  )}

                  {uifwCase.council_decision && (
                    <div className="border-t pt-4 bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-medium">Council Decision:</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {uifwCase.council_decision}
                      </p>
                      {uifwCase.council_decision_date && (
                        <p className="text-xs text-muted-foreground">
                          Decision Date: {format(new Date(uifwCase.council_decision_date), 'PPP')}
                        </p>
                      )}
                    </div>
                  )}

                  {uifwCase.implementation_status && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Implementation Status:</p>
                      <Badge variant="secondary">{uifwCase.implementation_status}</Badge>
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
