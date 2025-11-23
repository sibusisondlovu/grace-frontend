import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Introduction</h2>
            <p>
              G.R.A.C.E. (Government Reporting And Committee Execution) is committed to protecting 
              your privacy and complying with POPIA (Protection of Personal Information Act) and 
              other applicable privacy regulations.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Account Information</h3>
            <ul>
              <li>Name and email address</li>
              <li>Organization affiliation</li>
              <li>Role and department information</li>
              <li>Authentication credentials (encrypted)</li>
            </ul>

            <h3>2.2 Usage Data</h3>
            <ul>
              <li>Meeting attendance and participation</li>
              <li>Document uploads and access logs</li>
              <li>Action items and task assignments</li>
              <li>System activity and audit logs</li>
            </ul>

            <h3>2.3 Technical Information</h3>
            <ul>
              <li>IP addresses and device information</li>
              <li>Browser type and version</li>
              <li>Access times and referring URLs</li>
              <li>Performance and diagnostic data</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Provide and maintain the G.R.A.C.E. service</li>
              <li>Facilitate committee operations and governance</li>
              <li>Send notifications about meetings and action items</li>
              <li>Generate compliance reports and analytics</li>
              <li>Improve service quality and user experience</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            
            <h3>4.1 Security Measures</h3>
            <p>
              All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. 
              We implement role-based access control (RBAC) and row-level security (RLS) policies 
              to ensure data isolation between organizations.
            </p>

            <h3>4.2 Data Location</h3>
            <p>
              Data is stored on secure servers. For Azure Marketplace deployments, data may be 
              stored in Azure regions as specified in your subscription agreement.
            </p>

            <h3>4.3 Backup and Retention</h3>
            <p>
              We maintain automated backups with a retention period of 30 days. Long-term data 
              retention follows your organization's policy and applicable legal requirements.
            </p>

            <h2>5. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share data only in these circumstances:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>Within your organization as configured by administrators</li>
              <li>With service providers under strict confidentiality agreements</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>

            <h2>6. Your Privacy Rights</h2>
            <p>Under POPIA and GDPR, you have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal obligations)</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with supervisory authorities</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use 
              third-party tracking cookies. You can control cookie settings through your browser.
            </p>

            <h2>8. Third-Party Services</h2>
            <p>We integrate with the following third-party services:</p>
            <ul>
              <li>Supabase (database and authentication)</li>
              <li>Microsoft Azure (authentication and hosting)</li>
              <li>Resend (email notifications)</li>
            </ul>
            <p>Each service maintains its own privacy policy which we require to be compliant with applicable regulations.</p>

            <h2>9. Children's Privacy</h2>
            <p>
              G.R.A.C.E. is designed for use by government officials and is not intended for 
              children under 18. We do not knowingly collect information from children.
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              If you are accessing G.R.A.C.E. from outside South Africa, your information may be 
              transferred to and processed in South Africa or other jurisdictions where our service 
              providers operate. We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2>11. Data Breach Notification</h2>
            <p>
              In the event of a data breach affecting your personal information, we will notify 
              you and relevant authorities within 72 hours as required by POPIA.
            </p>

            <h2>12. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy periodically. We will notify you of significant 
              changes via email or in-app notification. Continued use after changes constitutes 
              acceptance of the updated policy.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              For privacy-related questions or to exercise your privacy rights, contact our 
              Data Protection Officer at:{" "}
              <a href="mailto:privacy@grace.gov.za">privacy@grace.gov.za</a>
            </p>

            <h2>14. Compliance Certifications</h2>
            <p>
              G.R.A.C.E. complies with:
            </p>
            <ul>
              <li>POPIA (Protection of Personal Information Act)</li>
              <li>GDPR (where applicable)</li>
              <li>ISO 27001 security standards</li>
              <li>Microsoft Azure security and compliance frameworks</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
