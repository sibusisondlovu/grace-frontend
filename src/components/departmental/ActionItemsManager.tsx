import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useActions } from "@/hooks/useActions";
import { useCreateAction, useUpdateAction } from "@/hooks/useActions";
import { DepartmentSelector } from "./DepartmentSelector";
import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actionItemSchema } from "@/lib/validation-schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { z } from "zod";

interface ActionItemsManagerProps {
  department?: string;
  committeeId?: string;
}

export const ActionItemsManager = ({ department, committeeId }: ActionItemsManagerProps) => {
  const { data: allActions = [] } = useActions();
  const createAction = useCreateAction();
  const updateAction = useUpdateAction();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof actionItemSchema>>({
    resolver: zodResolver(actionItemSchema),
    defaultValues: {
      title: '',
      description: '',
      assigned_to_department: department || '',
      due_date: '',
      priority: 'medium',
      status: 'pending',
    },
  });

  // Filter actions by department and committee
  const filteredActions = allActions.filter(action => {
    const matchesDept = !department || department === 'all' || action.assigned_to_department === department;
    const matchesCommittee = !committeeId || action.committee_id === committeeId;
    return matchesDept && matchesCommittee;
  });

  const handleSubmit = (values: z.infer<typeof actionItemSchema>) => {
    createAction.mutate({
      ...values,
      committee_id: committeeId,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateAction.mutate({ id, status });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <ClipboardList className="h-4 w-4" />;
    }
  };

  const pendingCount = filteredActions.filter(a => a.status === 'pending').length;
  const inProgressCount = filteredActions.filter(a => a.status === 'in_progress').length;
  const completedCount = filteredActions.filter(a => a.status === 'completed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Action Items
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Action
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Action Item</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assigned_to_department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <FormControl>
                          <DepartmentSelector
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select responsible department"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={createAction.isPending}>
                    Create Action Item
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredActions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No action items found
            </p>
          ) : (
            filteredActions.map((action) => (
              <div key={action.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(action.status)}
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <Badge variant={getPriorityColor(action.priority)}>
                    {action.priority}
                  </Badge>
                </div>

                {action.description && (
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {action.assigned_to_department && (
                      <Badge variant="outline">{action.assigned_to_department}</Badge>
                    )}
                    {action.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Due: {format(new Date(action.due_date), 'PP')}
                      </span>
                    )}
                  </div>

                  <Select
                    value={action.status}
                    onValueChange={(value) => handleStatusUpdate(action.id, value)}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
