import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";
import { ReactNode } from "react";

interface BrandingProviderProps {
  children: ReactNode;
}

/**
 * BrandingProvider applies organization branding (colors and logo)
 * to the application. It should be used at the app root level.
 */
export function BrandingProvider({ children }: BrandingProviderProps) {
  // Apply organization branding globally
  useOrganizationBranding();

  return <>{children}</>;
}
