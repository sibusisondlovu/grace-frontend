import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import graceLogo from "@/assets/grace-logo.png";

export default function Auth() {
  const { user, loading, signIn } = useAuth();
  const { data: onboardingStatus, isLoading: onboardingLoading } = useOnboardingStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [orgLogo, setOrgLogo] = useState<string | null>(null);

  // Load saved email and fetch organization logo
  useEffect(() => {
    const savedEmail = localStorage.getItem("cms-login-email");
    if (savedEmail) {
      setEmail(savedEmail);
      fetchOrganizationLogo(savedEmail);
    }
  }, []);

  // Fetch organization logo and branding based on email domain
  const fetchOrganizationLogo = async (emailAddress: string) => {
    const domain = emailAddress.split('@')[1];
    if (!domain) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('logo_url, primary_color, secondary_color')
        .eq('domain', domain)
        .single();

      if (!error && data) {
        if (data.logo_url) {
          setOrgLogo(data.logo_url);
        }
        
        // Apply organization colors to auth page
        if (data.primary_color && data.secondary_color) {
          const root = document.documentElement;
          
          // Convert hex to HSL
          const hexToHSL = (hex: string): string => {
            hex = hex.replace(/^#/, '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            let s = 0;
            const l = (max + min) / 2;

            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

              switch (max) {
                case r:
                  h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                  break;
                case g:
                  h = ((b - r) / d + 2) / 6;
                  break;
                case b:
                  h = ((r - g) / d + 4) / 6;
                  break;
              }
            }

            h = Math.round(h * 360);
            s = Math.round(s * 100);
            const lightness = Math.round(l * 100);

            return `${h} ${s}% ${lightness}%`;
          };

          const primaryHSL = hexToHSL(data.primary_color);
          const secondaryHSL = hexToHSL(data.secondary_color);
          
          root.style.setProperty('--primary', primaryHSL);
          root.style.setProperty('--accent', secondaryHSL);
        }
      } else {
        setOrgLogo(null);
      }
    } catch {
      setOrgLogo(null);
    }
  };

  // Save email to localStorage and fetch logo when it changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      localStorage.setItem("cms-login-email", newEmail);
      // Fetch logo when email contains @
      if (newEmail.includes('@')) {
        fetchOrganizationLogo(newEmail);
      }
    } else {
      localStorage.removeItem("cms-login-email");
      setOrgLogo(null);
    }
  };

  // Redirect if already authenticated
  if (!loading && !onboardingLoading && user && onboardingStatus) {
    if (onboardingStatus.needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    await signIn(email, password);
    setIsSubmitting(false);
  };

  const handleMicrosoftSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email openid profile',
          redirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-primary">
        <CardHeader className="text-center space-y-4">
          {orgLogo && (
            <div className="flex justify-center">
              <Avatar className="h-20 w-20 rounded-lg">
                <AvatarImage src={orgLogo} alt="Organization Logo" />
                <AvatarFallback className="rounded-lg bg-primary/10">
                  <img src={orgLogo} alt="Organization" className="h-full w-full object-contain" />
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="flex justify-center">
            <img 
              src={graceLogo} 
              alt="G.R.A.C.E. - Government Reporting And Committee Execution" 
              className="w-full max-w-md h-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                placeholder="your.email@domain.gov.za"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleMicrosoftSignIn}
            disabled={isSubmitting}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23">
              <path fill="#f3f3f3" d="M0 0h23v23H0z" />
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Sign in with Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}