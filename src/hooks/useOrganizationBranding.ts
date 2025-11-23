import { useEffect } from 'react';
import { useOrganization } from './useOrganizations';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

// Helper to convert hex to HSL
function hexToHSL(hex: string): string {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
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
}

export function useOrganizationBranding() {
  const { selectedOrganizationId } = useOrganizationContext();
  const { data: organization } = useOrganization(selectedOrganizationId);

  useEffect(() => {
    if (organization?.primary_color && organization?.secondary_color) {
      const root = document.documentElement;
      
      // Convert hex colors to HSL
      const primaryHSL = hexToHSL(organization.primary_color);
      const secondaryHSL = hexToHSL(organization.secondary_color);
      
      // Apply organization colors as CSS variables
      root.style.setProperty('--primary', primaryHSL);
      root.style.setProperty('--accent', secondaryHSL);
      
      // Also update related shades
      const [h, s, l] = primaryHSL.split(' ');
      const lightness = parseInt(l.replace('%', ''));
      
      // Create lighter and darker variants
      root.style.setProperty('--primary-light', `${h} ${s} ${Math.min(lightness + 60, 96)}%`);
      root.style.setProperty('--primary-glow', `${h} ${s} ${Math.min(lightness + 13, 100)}%`);
      
      // Update gradients
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${primaryHSL}), hsl(${h} ${s} ${Math.min(lightness + 13, 100)}%))`);
    }
  }, [organization]);

  return { 
    organization,
    logoUrl: organization?.logo_url 
  };
}
