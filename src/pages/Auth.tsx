import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import graceLogo from "@/assets/grace-logo.png";

export default function Auth() {
  const { user, loading, signIn } = useAuth();
  const { data: onboardingStatus, isLoading: onboardingLoading } = useOnboardingStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleMicrosoftSignIn = async () => {
    setIsSubmitting(true);
    await signIn();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-primary">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={graceLogo}
              alt="G.R.A.C.E. - Government Reporting And Committee Execution"
              className="w-full max-w-md h-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-6">
              Sign in with your organizational account to continue
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleMicrosoftSignIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
              )}
              Sign in with Microsoft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}