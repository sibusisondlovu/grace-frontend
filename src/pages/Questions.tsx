import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText } from 'lucide-react';
import { useQuestions } from '@/hooks/useQuestions';
import { format } from 'date-fns';

export default function Questions() {
  const { data: questions, isLoading } = useQuestions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      case 'pending':
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
            <h1 className="text-3xl font-bold">Questions to Executive</h1>
            <p className="text-muted-foreground">
              Track parliamentary questions and responses
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Submit Question
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading questions...</div>
        ) : (
          <div className="grid gap-4">
            {questions?.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {question.question_number}: {question.subject}
                      </CardTitle>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>Type: {question.question_type}</span>
                        <span>•</span>
                        <span>To: {question.addressed_to_dept}</span>
                        {question.addressed_to_mmc && (
                          <>
                            <span>•</span>
                            <span>MMC: {question.addressed_to_mmc}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(question.status)}>
                      {question.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Question:</p>
                    <p className="text-sm text-muted-foreground">
                      {question.question_text}
                    </p>
                  </div>

                  {question.response_text && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Response:</p>
                      <p className="text-sm text-muted-foreground">
                        {question.response_text}
                      </p>
                      {question.response_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on: {format(new Date(question.response_date), 'PPP')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>
                      Due: {format(new Date(question.due_date), 'PPP')}
                    </span>
                    {question.follow_up_required && (
                      <Badge variant="outline">
                        <FileText className="mr-1 h-3 w-3" />
                        Follow-up Required
                      </Badge>
                    )}
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
