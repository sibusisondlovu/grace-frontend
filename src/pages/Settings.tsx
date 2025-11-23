import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Bell, Moon, Globe, Shield, Database, Upload, Image as ImageIcon, Palette, MessageSquare, HelpCircle } from "lucide-react";
import { useOrganization, useUpdateOrganization } from "@/hooks/useOrganizations";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProductTour } from "@/hooks/useProductTour";

export default function Settings() {
  const { selectedOrganizationId } = useOrganizationContext();
  const { data: organization } = useOrganization(selectedOrganizationId);
  const updateOrganization = useUpdateOrganization();
  const { startTour } = useProductTour();
  const [uploading, setUploading] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>(organization?.primary_color || '#0EA5E9');
  const [secondaryColor, setSecondaryColor] = useState<string>(organization?.secondary_color || '#F59E0B');
  const [hasColorChanges, setHasColorChanges] = useState(false);
  const [savingColors, setSavingColors] = useState(false);
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState<string>((organization as any)?.teams_webhook_url || '');
  const [savingTeamsWebhook, setSavingTeamsWebhook] = useState(false);

  // Update local state when organization data loads
  useEffect(() => {
    if (organization) {
      setPrimaryColor(organization.primary_color || '#0EA5E9');
      setSecondaryColor(organization.secondary_color || '#F59E0B');
      setTeamsWebhookUrl((organization as any)?.teams_webhook_url || '');
    }
  }, [organization]);

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!selectedFile || !organization) return;

    try {
      setUploading(true);

      // Delete old logo if exists
      if (organization.logo_url) {
        const oldPath = organization.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('organization-logos').remove([`${organization.id}/${oldPath}`]);
        }
      }

      // Upload new logo
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${organization.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      // Update organization
      await updateOrganization.mutateAsync({
        id: organization.id,
        logo_url: publicUrl,
      });

      toast({
        title: "Logo Updated",
        description: "Your organization logo has been uploaded successfully.",
      });

      // Clear preview and refresh to show changes
      setPreviewLogo(null);
      setSelectedFile(null);
      
      // Force refresh to show logo on auth page
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewLogo(null);
    setSelectedFile(null);
  };

  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColor(e.target.value);
    setHasColorChanges(true);
  };

  const handleSecondaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecondaryColor(e.target.value);
    setHasColorChanges(true);
  };

  const handleSaveColors = async () => {
    if (!organization) return;

    try {
      setSavingColors(true);

      await updateOrganization.mutateAsync({
        id: organization.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      toast({
        title: "Colors Updated",
        description: "Your organization colors have been saved. The changes will apply throughout the application.",
      });

      setHasColorChanges(false);

      // Force a brief delay to allow the query to update, then refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingColors(false);
    }
  };

  const handleResetColors = () => {
    setPrimaryColor(organization?.primary_color || '#0EA5E9');
    setSecondaryColor(organization?.secondary_color || '#F59E0B');
    setHasColorChanges(false);
  };

  const handleSaveTeamsWebhook = async () => {
    if (!organization) return;

    try {
      setSavingTeamsWebhook(true);

      await updateOrganization.mutateAsync({
        id: organization.id,
        teams_webhook_url: teamsWebhookUrl || null,
      } as any);

      toast({
        title: "Teams Integration Updated",
        description: teamsWebhookUrl 
          ? "Microsoft Teams notifications are now enabled for your organization."
          : "Microsoft Teams notifications have been disabled.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingTeamsWebhook(false);
    }
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your application preferences</p>
      </div>

      <div className="space-y-6">
        {/* Organization Branding */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <CardTitle>Organization Branding</CardTitle>
            </div>
            <CardDescription>Customize your organization's logo and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Organization Logo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 rounded-lg">
                  <AvatarImage src={organization?.logo_url || ''} alt={organization?.name} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {organization?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Upload a logo for your organization. This will be displayed on the login page.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      disabled={uploading}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Logo
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {previewLogo && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Preview</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelPreview}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleLogoUpload}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Save Logo"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This is how your logo will appear on the authentication page:
                </p>
                
                {/* Auth Page Preview */}
                <Card className="bg-gradient-to-br from-background via-secondary/20 to-primary/10 border-border/50">
                  <CardContent className="p-8">
                    <div className="max-w-md mx-auto bg-card rounded-lg border shadow-card p-6">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <Avatar className="h-20 w-20 rounded-lg">
                            <AvatarImage src={previewLogo} alt="Preview Logo" />
                            <AvatarFallback className="rounded-lg bg-primary/10">
                              <img src={previewLogo} alt="Preview" className="h-full w-full object-contain" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                            G.R.A.C.E.
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Government Reporting And Committee Execution
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-10 bg-muted/30 rounded-md" />
                          <div className="h-10 bg-muted/30 rounded-md" />
                          <div className="h-10 bg-primary/20 rounded-md" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Brand Colors</CardTitle>
            </div>
            <CardDescription>Customize your organization's brand colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={handlePrimaryColorChange}
                    className="h-12 w-20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setHasColorChanges(true);
                    }}
                    className="flex-1 font-mono"
                    placeholder="#0EA5E9"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Main brand color used throughout the application
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={secondaryColor}
                    onChange={handleSecondaryColorChange}
                    className="h-12 w-20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      setHasColorChanges(true);
                    }}
                    className="flex-1 font-mono"
                    placeholder="#F59E0B"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Accent color for highlights and secondary elements
                </p>
              </div>
            </div>

            {/* Color Preview */}
            {hasColorChanges && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Preview</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetColors}
                      disabled={savingColors}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveColors}
                      disabled={savingColors}
                    >
                      {savingColors ? "Saving..." : "Save Colors"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Preview how your colors will look (refresh page after saving to see changes):
                </p>
                
                <Card className="border-2">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Primary Color</p>
                        <div 
                          className="h-20 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Primary
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Secondary Color</p>
                        <div 
                          className="h-20 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          Accent
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sample Components</p>
                      <div className="flex gap-2 flex-wrap">
                        <button 
                          className="px-4 py-2 rounded-md text-white font-medium"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Primary Button
                        </button>
                        <button 
                          className="px-4 py-2 rounded-md text-white font-medium"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          Accent Button
                        </button>
                        <div 
                          className="px-4 py-2 rounded-md flex items-center gap-2"
                          style={{ 
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor,
                            border: `1px solid ${primaryColor}40`
                          }}
                        >
                          <div 
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                          />
                          Status Badge
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Microsoft Teams Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Microsoft Teams Integration</CardTitle>
            </div>
            <CardDescription>
              Receive real-time notifications in Microsoft Teams for important events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teams-webhook">Incoming Webhook URL</Label>
              <Input
                id="teams-webhook"
                type="url"
                placeholder="https://outlook.office.com/webhook/..."
                value={teamsWebhookUrl}
                onChange={(e) => setTeamsWebhookUrl(e.target.value)}
                disabled={savingTeamsWebhook}
              />
              <p className="text-sm text-muted-foreground">
                Enter your Microsoft Teams channel's incoming webhook URL to enable notifications.
                {' '}
                <a 
                  href="https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn how to create a webhook
                </a>
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Notifications will be sent for:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>New meetings scheduled</li>
                <li>Meeting minutes published</li>
                <li>Important decisions made</li>
                <li>Action items assigned</li>
              </ul>
            </div>

            <Button 
              onClick={handleSaveTeamsWebhook}
              disabled={savingTeamsWebhook}
            >
              {savingTeamsWebhook ? "Saving..." : "Save Teams Integration"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="meeting-reminders">Meeting Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders for upcoming meetings
                </p>
              </div>
              <Switch id="meeting-reminders" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="action-alerts">Action Item Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for assigned action items
                </p>
              </div>
              <Switch id="action-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Moon className="h-5 w-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select defaultValue="system">
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Language & Region</CardTitle>
            </div>
            <CardDescription>Set your language and regional preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="af">Afrikaans</SelectItem>
                  <SelectItem value="zu">isiZulu</SelectItem>
                  <SelectItem value="xh">isiXhosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="sast">
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sast">South Africa Standard Time (SAST)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>Manage your security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch id="two-factor" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="session-timeout">Auto Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after inactivity
                </p>
              </div>
              <Switch id="session-timeout" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Data & Storage</CardTitle>
            </div>
            <CardDescription>Manage your data and storage preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Storage Used</Label>
                <p className="text-sm text-muted-foreground">
                  256 MB of 10 GB used
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup your data
                </p>
              </div>
              <Switch id="auto-backup" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <CardTitle>Help & Support</CardTitle>
            </div>
            <CardDescription>Get help and learn about the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Product Tour</Label>
                <p className="text-sm text-muted-foreground">
                  Restart the interactive tour to learn about key features
                </p>
              </div>
              <Button variant="outline" onClick={startTour}>
                Start Tour
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save All Settings</Button>
        </div>
      </div>
    </div>
  );
}
