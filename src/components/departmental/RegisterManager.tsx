import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus } from "lucide-react";
import { useDepartmentalRegisters, useCreateDepartmentalRegister, useUpdateDepartmentalRegister } from "@/hooks/useDepartmentalRegisters";
import { DepartmentSelector } from "./DepartmentSelector";
import { useState } from "react";
import { format } from "date-fns";

interface RegisterManagerProps {
  department?: string;
}

export const RegisterManager = ({ department }: RegisterManagerProps) => {
  const { data: registers = [] } = useDepartmentalRegisters(department !== 'all' ? department : undefined);
  const createRegister = useCreateDepartmentalRegister();
  const updateRegister = useUpdateDepartmentalRegister();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: department || '',
    register_type: 'decision',
    title: '',
    description: '',
    status: 'pending',
    due_date: '',
    metadata: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRegister.mutate(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          department: department || '',
          register_type: 'decision',
          title: '',
          description: '',
          status: 'pending',
          due_date: '',
          metadata: {},
        });
      }
    });
  };

  const handleStatusUpdate = (id: string, status: string, completion_date?: string) => {
    updateRegister.mutate({ 
      id, 
      status,
      ...(status === 'completed' && { completion_date: completion_date || new Date().toISOString().split('T')[0] })
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'default';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const pendingCount = registers.filter(r => r.status === 'pending').length;
  const inProgressCount = registers.filter(r => r.status === 'in_progress').length;
  const completedCount = registers.filter(r => r.status === 'completed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Departmental Registers
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Register Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <DepartmentSelector
                  value={formData.department}
                  onChange={(value) => setFormData({ ...formData, department: value })}
                />

                <div className="space-y-2">
                  <Label htmlFor="register_type">Register Type</Label>
                  <Select
                    value={formData.register_type}
                    onValueChange={(value) => setFormData({ ...formData, register_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="decision">Decision</SelectItem>
                      <SelectItem value="resolution">Resolution</SelectItem>
                      <SelectItem value="action">Action Item</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createRegister.isPending}>
                  Create Register Entry
                </Button>
              </form>
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
          {registers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No register entries found
            </p>
          ) : (
            registers.map((register) => (
              <div key={register.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{register.title}</span>
                      <Badge variant="outline">{register.register_type}</Badge>
                    </div>
                    {register.description && (
                      <p className="text-sm text-muted-foreground">{register.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">{register.department}</Badge>
                    {register.due_date && (
                      <span className="text-muted-foreground">
                        Due: {format(new Date(register.due_date), 'PP')}
                      </span>
                    )}
                    {register.completion_date && (
                      <span className="text-green-600">
                        Completed: {format(new Date(register.completion_date), 'PP')}
                      </span>
                    )}
                  </div>

                  <Select
                    value={register.status}
                    onValueChange={(value) => handleStatusUpdate(register.id, value)}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
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
