import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2, User, Rocket } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Organization data
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgDomain, setOrgDomain] = useState('');

  // User data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleComplete = async () => {
    if (!orgName || !orgSlug || !firstName || !lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Use the database function for a complete onboarding
      const { data, error } = await supabase.rpc('complete_user_onboarding', {
        _user_id: user?.id,
        _organization_name: orgName,
        _organization_domain: orgDomain || orgSlug,
        _first_name: firstName,
        _last_name: lastName
      });

      if (error) throw error;
      
      const result = data as any;
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete onboarding');
      }

      toast.success('Setup complete! Welcome to G.R.A.C.E.');
      
      // Mark that user should see the tour
      localStorage.setItem('show-product-tour', 'true');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(`Failed to complete setup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">
            Welcome to G.R.A.C.E.
          </CardTitle>
          <CardDescription>
            Government Reporting And Committee Execution - Let's set up your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Organization Details
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name *</Label>
              <Input
                id="orgName"
                placeholder="e.g., City of Johannesburg"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  // Auto-generate slug
                  setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgSlug">Organization Slug *</Label>
              <Input
                id="orgSlug"
                placeholder="city-of-johannesburg"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Used for URLs and identification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgDomain">Domain (Optional)</Label>
              <Input
                id="orgDomain"
                placeholder="joburg.org.za"
                value={orgDomain}
                onChange={(e) => setOrgDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Email domain for auto-assigning new users to your organization
              </p>
            </div>
          </div>

          {/* User Profile Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Your Profile
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              What happens next?
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your organization will be created</li>
              <li>• You'll be assigned as an administrator</li>
              <li>• A quick product tour will guide you through key features</li>
              <li>• You can start creating committees and scheduling meetings</li>
            </ul>
          </div>

          <Button
            onClick={handleComplete}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Setting up...' : 'Complete Setup & Get Started'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
