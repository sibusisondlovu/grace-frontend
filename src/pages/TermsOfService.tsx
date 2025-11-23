import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using G.R.A.C.E. (Government Reporting And Committee Execution), 
              you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Service Description</h2>
            <p>
              G.R.A.C.E. provides a comprehensive committee management system for government 
              organizations, including meeting scheduling, document management, compliance tracking, 
              and reporting capabilities.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account. You must notify us immediately 
              of any unauthorized use of your account.
            </p>

            <h2>4. Data Security and Privacy</h2>
            <p>
              We implement industry-standard security measures to protect your data. All data is 
              encrypted in transit and at rest. We comply with applicable data protection regulations 
              including POPIA (Protection of Personal Information Act) and GDPR where applicable.
            </p>

            <h2>5. Subscription and Billing</h2>
            <p>
              Our services are provided on a subscription basis. Payment terms are outlined in your 
              organization's subscription agreement. We reserve the right to modify pricing with 
              30 days notice to existing customers.
            </p>

            <h2>6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any illegal purposes</li>
              <li>Attempt to gain unauthorized access to the service or related systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Upload malicious code or content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2>7. Data Ownership and Backup</h2>
            <p>
              You retain all rights to your data. We maintain regular backups, but you are 
              responsible for maintaining your own backups of critical data. We provide export 
              functionality for this purpose.
            </p>

            <h2>8. Service Availability</h2>
            <p>
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. 
              Scheduled maintenance will be announced in advance when possible.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              G.R.A.C.E. shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use or inability to use the service.
            </p>

            <h2>10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the service for violation 
              of these terms. Upon termination, you may export your data within 30 days.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of 
              significant changes via email or in-app notification.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These terms shall be governed by the laws of South Africa. Any disputes shall be 
              resolved in the courts of South Africa.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              For questions about these terms, please contact us at:{" "}
              <a href="mailto:support@grace.gov.za">support@grace.gov.za</a>
            </p>

            <h2>14. Azure Marketplace Specific Terms</h2>
            <p>
              For customers subscribing through Azure Marketplace, additional terms and conditions 
              from Microsoft Azure Marketplace may apply. Billing will be processed through your 
              Azure subscription.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
