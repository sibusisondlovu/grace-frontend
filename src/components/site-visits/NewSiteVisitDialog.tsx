import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateSiteVisit } from '@/hooks/useSiteVisits';
import { useCommittees } from '@/hooks/useCommittees';
import { useMembers } from '@/hooks/useMembers';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteVisitSchema } from '@/lib/validation-schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { z } from 'zod';

export function NewSiteVisitDialog() {
  const [open, setOpen] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState<string>('');
  const { mutate: createSiteVisit, isPending } = useCreateSiteVisit();
  const { data: committees } = useCommittees();
  const { data: members } = useMembers(selectedCommittee || undefined);

  const form = useForm<z.infer<typeof siteVisitSchema>>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: {
      visit_number: '',
      committee_id: '',
      site_location: '',
      site_address: '',
      visit_date: format(new Date(), 'yyyy-MM-dd'),
      visit_purpose: '',
      participants: [],
    },
  });

  const handleSubmit = (values: z.infer<typeof siteVisitSchema>) => {
    createSiteVisit({
      ...values,
      site_address: values.site_address || null,
      status: 'planned',
      report_drafted: false,
    }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setSelectedCommittee('');
      }
    });
  };

  const toggleParticipant = (userId: string) => {
    const currentParticipants = form.getValues('participants');
    const updatedParticipants = currentParticipants.includes(userId)
      ? currentParticipants.filter(id => id !== userId)
      : [...currentParticipants, userId];
    form.setValue('participants', updatedParticipants);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Site Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Site Visit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visit_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., SV-2025-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={format(new Date(), 'yyyy-MM-dd')} />
                    </FormControl>
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
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCommittee(value);
                    }} 
                    value={field.value}
                  >
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
              name="site_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Location *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Alexandra Water Treatment Plant" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="site_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full address (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visit_purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Purpose *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Describe the purpose of this site visit..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCommittee && members && members.length > 0 && (
              <FormField
                control={form.control}
                name="participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Participants *</FormLabel>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                      {members.map((member) => (
                        <div key={member.user_id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`participant-${member.user_id}`}
                            checked={field.value.includes(member.user_id)}
                            onChange={() => toggleParticipant(member.user_id)}
                            className="rounded"
                          />
                          <label 
                            htmlFor={`participant-${member.user_id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {member.profile?.first_name} {member.profile?.last_name} ({member.role})
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || form.getValues('participants').length === 0}
              >
                {isPending ? 'Scheduling...' : 'Schedule Visit'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
