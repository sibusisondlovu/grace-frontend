import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit } from 'lucide-react';
import { useUpdateSiteVisit } from '@/hooks/useSiteVisits';

interface UpdateSiteVisitDialogProps {
  visit: any;
}

export function UpdateSiteVisitDialog({ visit }: UpdateSiteVisitDialogProps) {
  const [open, setOpen] = useState(false);
  const [evidenceItems, setEvidenceItems] = useState<string[]>(visit.evidence_collected || []);
  const [newEvidence, setNewEvidence] = useState('');
  const { mutate: updateSiteVisit, isPending } = useUpdateSiteVisit();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateSiteVisit({
      id: visit.id,
      status: formData.get('status') as string,
      observations: formData.get('observations') as string || null,
      findings: formData.get('findings') as string || null,
      evidence_collected: evidenceItems.length > 0 ? evidenceItems : null,
      report_drafted: formData.get('report_drafted') === 'true',
      report_text: formData.get('report_text') as string || null,
    }, {
      onSuccess: () => {
        setOpen(false);
      }
    });
  };

  const addEvidence = () => {
    if (newEvidence.trim()) {
      setEvidenceItems([...evidenceItems, newEvidence.trim()]);
      setNewEvidence('');
    }
  };

  const removeEvidence = (index: number) => {
    setEvidenceItems(evidenceItems.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Update Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Site Visit: {visit.visit_number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status*</Label>
            <Select name="status" defaultValue={visit.status} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea 
              id="observations" 
              name="observations" 
              rows={4}
              defaultValue={visit.observations || ''}
              placeholder="Document observations made during the visit..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="findings">Findings</Label>
            <Textarea 
              id="findings" 
              name="findings" 
              rows={4}
              defaultValue={visit.findings || ''}
              placeholder="Key findings from the site visit..."
            />
          </div>

          <div className="space-y-2">
            <Label>Evidence Collected</Label>
            <div className="flex gap-2">
              <Input 
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                placeholder="Add evidence item..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEvidence())}
              />
              <Button type="button" onClick={addEvidence} variant="secondary">
                Add
              </Button>
            </div>
            {evidenceItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {evidenceItems.map((item, idx) => (
                  <div key={idx} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeEvidence(idx)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="report_drafted" 
                name="report_drafted"
                defaultChecked={visit.report_drafted}
                value="true"
              />
              <Label htmlFor="report_drafted" className="cursor-pointer">
                Report Drafted
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report_text">Report Text</Label>
            <Textarea 
              id="report_text" 
              name="report_text" 
              rows={6}
              defaultValue={visit.report_text || ''}
              placeholder="Full site visit report..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Visit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
