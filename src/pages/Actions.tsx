import { useActions, useCreateAction, useUpdateAction } from "@/hooks/useActions";
import { useCommittees } from "@/hooks/useCommittees";
import { CheckSquare, Plus, Search, Filter, Calendar, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Actions() {
  const { data: actions, isLoading } = useActions();
  const { data: committees } = useCommittees();
  const createAction = useCreateAction();
  const updateAction = useUpdateAction();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  const filteredActions = actions?.filter((action) => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.committee?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || action.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || action.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleCreateAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const actionData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      committee_id: formData.get("committee_id") as string,
      priority: formData.get("priority") as string,
      due_date: formData.get("due_date") ? new Date(formData.get("due_date") as string).toISOString().split('T')[0] : undefined,
      assigned_to_department: formData.get("assigned_to_department") as string || undefined,
      status: "pending" as const,
    };

    createAction.mutate(actionData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  const handleStatusUpdate = (actionId: string, newStatus: string) => {
    updateAction.mutate({
      id: actionId,
      status: newStatus
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span>Action Items</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage action items across all committees
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Action</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Action Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input name="title" placeholder="Enter action item title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" placeholder="Detailed description of the action item" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="committee_id">Committee</Label>
                <Select name="committee_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a committee" />
                  </SelectTrigger>
                  <SelectContent>
                    {committees?.map((committee) => (
                      <SelectItem key={committee.id} value={committee.id}>
                        {committee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input name="due_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to_department">Assigned Department</Label>
                <Input name="assigned_to_department" placeholder="Department responsible for this action" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAction.isPending}>
                  {createAction.isPending ? "Creating..." : "Create Action"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search action items..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-12" /> : actions?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? <Skeleton className="h-8 w-12" /> : actions?.filter(a => a.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? <Skeleton className="h-8 w-12" /> : actions?.filter(a => a.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? <Skeleton className="h-8 w-12" /> : actions?.filter(a => a.priority === 'high').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))
        ) : filteredActions?.length ? (
          filteredActions.map((action) => (
            <Card key={action.id} className="shadow-card hover:shadow-primary transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{action.title}</h3>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority} priority
                      </Badge>
                    </div>
                    {action.description && (
                      <p className="text-muted-foreground mb-3 text-sm">
                        {action.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      {action.committee && (
                        <div className="flex items-center space-x-1">
                          <CheckSquare className="h-4 w-4" />
                          <span>{action.committee}</span>
                        </div>
                      )}
                      {action.assignee && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{action.assignee}</span>
                        </div>
                      )}
                      {action.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {format(new Date(action.due_date), 'PP')}</span>
                          {new Date(action.due_date) < new Date() && action.status !== 'completed' && (
                            <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Select 
                      value={action.status} 
                      onValueChange={(value) => handleStatusUpdate(action.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setSelectedAction(action)}>
                      Edit Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : actions?.length ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No action items found matching your criteria</div>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">No action items have been created yet</div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Action Item
            </Button>
          </div>
        )}
      </div>

      {/* Action Details Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Action Item Details</DialogTitle>
          </DialogHeader>
          {selectedAction && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Title</h3>
                <p className="text-muted-foreground">{selectedAction.title}</p>
              </div>
              {selectedAction.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedAction.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge className={getStatusColor(selectedAction.status)}>
                    {selectedAction.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Priority</h3>
                  <Badge className={getPriorityColor(selectedAction.priority)}>
                    {selectedAction.priority} priority
                  </Badge>
                </div>
              </div>
              {selectedAction.due_date && (
                <div>
                  <h3 className="font-semibold mb-2">Due Date</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(selectedAction.due_date), 'PPP')}
                  </p>
                </div>
              )}
              {selectedAction.assigned_to_department && (
                <div>
                  <h3 className="font-semibold mb-2">Assigned Department</h3>
                  <p className="text-muted-foreground">{selectedAction.assigned_to_department}</p>
                </div>
              )}
              {selectedAction.assignee && selectedAction.assignee !== 'Unassigned' && (
                <div>
                  <h3 className="font-semibold mb-2">Assigned To</h3>
                  <p className="text-muted-foreground">{selectedAction.assignee}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Committee</h3>
                <p className="text-muted-foreground">{selectedAction.committee}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Created</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(selectedAction.created_at), 'PPP')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Last Updated</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(selectedAction.updated_at), 'PPP')}
                  </p>
                </div>
              </div>
              {selectedAction.resolution_text && (
                <div>
                  <h3 className="font-semibold mb-2">Resolution</h3>
                  <p className="text-muted-foreground">{selectedAction.resolution_text}</p>
                </div>
              )}
              {selectedAction.outcome && (
                <div>
                  <h3 className="font-semibold mb-2">Outcome</h3>
                  <p className="text-muted-foreground">{selectedAction.outcome}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}