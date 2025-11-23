import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useOrganizations, useCreateOrganization, useUpdateOrganization } from "@/hooks/useOrganizations";
import { useHasRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, Edit, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

const organizationSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(100, "Name must be less than 100 characters"),
  slug: z.string().trim().min(1, "Slug is required").max(50, "Slug must be less than 50 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  contact_email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal('')),
  domain: z.string().trim().max(100, "Domain must be less than 100 characters").regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Invalid domain format (e.g., organization.gov.za)").optional().or(z.literal('')),
  subscription_tier: z.enum(['standard', 'premium', 'enterprise']),
});

export default function Organizations() {
  const { hasRole: isSuperAdmin } = useHasRole('super_admin');
  const { data: organizations, isLoading } = useOrganizations();
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    contact_email: '',
    domain: '',
    subscription_tier: 'standard' as 'standard' | 'premium' | 'enterprise',
  });

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // Validate form data
    try {
      organizationSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.issues[0].message);
        return;
      }
    }
    
    // Check for duplicate domain
    if (formData.domain) {
      const existingOrgWithDomain = organizations?.find(
        org => org.domain === formData.domain && org.id !== editingOrg
      );
      
      if (existingOrgWithDomain) {
        setValidationError(`Domain "${formData.domain}" is already used by ${existingOrgWithDomain.name}`);
        return;
      }
    }
    
    try {
      if (editingOrg) {
        await updateOrganization.mutateAsync({
          id: editingOrg,
          ...formData,
        });
        setEditingOrg(null);
      } else {
        await createOrganization.mutateAsync({
          ...formData,
          is_active: true,
          subscription_status: 'trial',
          primary_color: '#0EA5E9',
          secondary_color: '#F59E0B',
          domain: formData.domain || null,
          logo_url: null,
          contact_phone: null,
          address: null,
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      setIsCreateDialogOpen(false);
      setValidationError('');
      setFormData({ name: '', slug: '', contact_email: '', domain: '', subscription_tier: 'standard' });
    } catch (error) {
      console.error('Error saving organization:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-blue-500';
      case 'suspended': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground mt-2">Manage municipality subscriptions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingOrg ? 'Edit' : 'Create'} Organization</DialogTitle>
                  <DialogDescription>
                    {editingOrg ? 'Update' : 'Add a new'} municipality to G.R.A.C.E.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {validationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="City of Johannesburg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="city-of-johannesburg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="info@organization.gov.za"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Email Domain</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="organization.gov.za"
                    />
                    <p className="text-xs text-muted-foreground">
                      Users with this email domain will be auto-assigned to this organization
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier">Subscription Tier</Label>
                    <Select
                      value={formData.subscription_tier}
                      onValueChange={(value: any) => setFormData({ ...formData, subscription_tier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createOrganization.isPending || updateOrganization.isPending}>
                    {editingOrg ? 'Update' : 'Create'} Organization
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizations?.map((org) => (
              <Card key={org.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingOrg(org.id);
                        setValidationError('');
                        setFormData({
                          name: org.name,
                          slug: org.slug,
                          contact_email: org.contact_email || '',
                          domain: org.domain || '',
                          subscription_tier: org.subscription_tier,
                        });
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>{org.slug}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(org.subscription_status)}>
                      {org.subscription_status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tier</span>
                    <Badge variant="outline">{org.subscription_tier}</Badge>
                  </div>
                  {org.contact_email && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Contact:</span>
                      <p className="font-medium truncate">{org.contact_email}</p>
                    </div>
                  )}
                  {org.domain && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Email Domain:</span>
                      <p className="font-medium truncate">{org.domain}</p>
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
