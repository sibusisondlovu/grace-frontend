import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateUIFWCase } from '@/hooks/useUIFWCases';
import { Plus } from 'lucide-react';

interface NewCaseFormData {
  case_number: string;
  case_type: string;
  financial_year: string;
  department: string;
  description: string;
  amount: number;
  date_opened: string;
  status: string;
}

export function NewCaseDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<NewCaseFormData>();
  const createCase = useCreateUIFWCase();

  const onSubmit = async (data: NewCaseFormData) => {
    await createCase.mutateAsync(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New UIFW Case</DialogTitle>
          <DialogDescription>
            Record a new Unauthorized, Irregular, Fruitless & Wasteful Expenditure case
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="case_number">Case Number *</Label>
              <Input
                id="case_number"
                {...register('case_number', { required: 'Case number is required' })}
                placeholder="e.g., UIFW-2024-001"
              />
              {errors.case_number && (
                <p className="text-sm text-destructive">{errors.case_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="case_type">Case Type *</Label>
              <Select onValueChange={(value) => setValue('case_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unauthorized">Unauthorized</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="fruitless">Fruitless</SelectItem>
                  <SelectItem value="wasteful">Wasteful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="financial_year">Financial Year *</Label>
              <Input
                id="financial_year"
                {...register('financial_year', { required: 'Financial year is required' })}
                placeholder="e.g., 2024/2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                {...register('department', { required: 'Department is required' })}
                placeholder="e.g., Finance"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ZAR) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { 
                  required: 'Amount is required',
                  valueAsNumber: true 
                })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_opened">Date Opened *</Label>
              <Input
                id="date_opened"
                type="date"
                {...register('date_opened', { required: 'Date is required' })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem value="hearing_scheduled">Hearing Scheduled</SelectItem>
                  <SelectItem value="pending_council_decision">Pending Council Decision</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                placeholder="Provide detailed description of the case..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCase.isPending}>
              {createCase.isPending ? 'Creating...' : 'Create Case'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
