import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-6 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} G.R.A.C.E. - Government Reporting And Committee Execution. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link 
              to="/terms-of-service" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link 
              to="/privacy-policy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <a 
              href="mailto:support@grace.gov.za" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
