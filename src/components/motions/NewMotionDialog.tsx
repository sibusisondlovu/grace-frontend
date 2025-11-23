import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateMotion } from '@/hooks/useMotions';
import { useCommittees } from '@/hooks/useCommittees';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motionSchema } from '@/lib/validation-schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { z } from 'zod';

interface NewMotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewMotionDialog({ open, onOpenChange }: NewMotionDialogProps) {
  const { user } = useAuth();
  const { data: committees } = useCommittees();
  const createMotion = useCreateMotion();

  const form = useForm<z.infer<typeof motionSchema>>({
    resolver: zodResolver(motionSchema),
    defaultValues: {
      motion_number: '',
      motion_type: 'ordinary',
      title: '',
      motion_text: '',
      notice_date: format(new Date(), 'yyyy-MM-dd'),
      committee_id: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof motionSchema>) => {
    if (!user) return;

    await createMotion.mutateAsync({
      ...values,
      submitter_id: user.id,
      status: 'draft',
      admissibility_status: 'pending',
    });

    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit New Motion</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="motion_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motion Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., M001/2025" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motion_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motion Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ordinary">Ordinary Motion</SelectItem>
                        <SelectItem value="urgent">Urgent Motion</SelectItem>
                        <SelectItem value="procedural">Procedural Motion</SelectItem>
                        <SelectItem value="amendment">Amendment</SelectItem>
                        <SelectItem value="substantive">Substantive Motion</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="committee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Committee *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select committee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {committees?.map((committee) => (
                        <SelectItem key={committee.id} value={committee.id}>
                          {committee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motion Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief title describing the motion" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motion_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motion Text *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Full text of the motion" rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notice_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notice Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMotion.isPending}>
                {createMotion.isPending ? 'Submitting...' : 'Submit Motion'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
