import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | VelvetHold",
  description: "Privacy Policy for VelvetHold dating platform",
};

export default function PrivacyPolicy() {
  const lastUpdated = "January 2026";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">1. Overview</h2>
            <p>
              VelvetHold ("we," "us," "our," or "Company") respects your privacy
              and is committed to protecting your personal data. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website and use our services.
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with
              our policies and practices, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">2.1 Information Provided by You</h3>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>Account Registration:</strong> Email, password, full
                name, date of birth, phone number, location
              </li>
              <li>
                <strong>Profile Information:</strong> Photos, bio, interests,
                preferences, screening questions and answers
              </li>
              <li>
                <strong>Payment Information:</strong> Credit/debit card details
                (processed via Stripe; we do not store full card numbers)
              </li>
              <li>
                <strong>Verification Documents:</strong> ID documents (driver's
                license, passport), selfies for identity verification via Persona
              </li>
              <li>
                <strong>Communications:</strong> Messages, date request details,
                support inquiries
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">2.2 Automatically Collected Information</h3>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>Device Information:</strong> Device type, operating
                system, browser type, IP address
              </li>
              <li>
                <strong>Usage Information:</strong> Pages visited, time spent,
                clicks, searches, interactions
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> We use cookies, web beacons,
                and similar tracking technologies to enhance your experience
              </li>
              <li>
                <strong>Location Data:</strong> Approximate location based on IP
                address (not precise GPS)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">2.3 Third-Party Information</h3>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>Persona:</strong> Identity verification and background
                information
              </li>
              <li>
                <strong>Stripe:</strong> Payment processing and dispute
                information
              </li>
              <li>
                <strong>Social Login Providers:</strong> If you use Google,
                Apple, or Facebook login, we receive your email and profile
                information from those providers
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
            <p>VelvetHold uses your information for:</p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Creating and maintaining your account</li>
              <li>Facilitating date requests and deposit management</li>
              <li>Identity and payment verification</li>
              <li>Improving and personalizing the Service</li>
              <li>Communicating with you about your account and transactions</li>
              <li>Detecting fraud and preventing abuse</li>
              <li>Complying with legal obligations</li>
              <li>Analytics and performance monitoring</li>
              <li>Marketing and promotional purposes (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">4. Data Sharing & Disclosure</h2>
            <p>
              We do not sell your personal data. We share information only in
              these circumstances:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>Service Providers:</strong> Payment processors (Stripe),
                email services (Resend), identity verification (Persona)
              </li>
              <li>
                <strong>Other Users:</strong> Your profile information is visible
                to other users of the Service
              </li>
              <li>
                <strong>Legal Requirements:</strong> Law enforcement,
                government agencies, court orders
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of merger,
                acquisition, or asset sale
              </li>
              <li>
                <strong>Safety & Harm Prevention:</strong> Protect rights, safety,
                and security
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              data:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>AES-256 encryption at rest</li>
              <li>TLS 1.3 encryption in transit</li>
              <li>Bcrypt password hashing (cost 12)</li>
              <li>Regular security audits and penetration testing</li>
              <li>Limited access to sensitive data (least privilege principle)</li>
            </ul>
            <p className="mt-4">
              However, no security system is impenetrable. We cannot guarantee
              absolute security of your information. You use the Service at your
              own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">6. Retention of Your Data</h2>
            <p>
              We retain your data for as long as necessary to provide the Service
              and comply with legal obligations. You may delete your account at
              any time, and we will:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Delete your profile and personal information within 30 days</li>
              <li>
                Retain transaction records as required by law (typically 7
                years)
              </li>
              <li>Anonymize behavioral data for analytics purposes</li>
              <li>
                Keep contact information if required by legal/regulatory
                obligations
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">7. Your Rights & Choices</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">7.1 GDPR Rights (EU Users)</h3>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>Right to Access:</strong> Request a copy of your data
              </li>
              <li>
                <strong>Right to Rectification:</strong> Correct inaccurate data
              </li>
              <li>
                <strong>Right to Erasure:</strong> Delete your data ("right to be
                forgotten")
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Receive data in
                machine-readable format
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> Limit how we use
                your data
              </li>
              <li>
                <strong>Right to Object:</strong> Opt-out of marketing and
                processing
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">7.2 CCPA Rights (California Users)</h3>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>Right to Know:</strong> Request categories and specific
                pieces of personal information
              </li>
              <li>
                <strong>Right to Delete:</strong> Request deletion of personal
                information
              </li>
              <li>
                <strong>Right to Opt-Out:</strong> Opt-out of sale of personal
                information (which we do not do)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">7.3 Marketing & Communications</h3>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>You can opt-out of marketing emails by clicking "Unsubscribe"</li>
              <li>You can disable cookies in your browser settings</li>
              <li>You can update communication preferences in account settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">8. Cookies & Tracking</h2>
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Remember your preferences and login information</li>
              <li>Understand how you use the Service</li>
              <li>Personalize content and recommendations</li>
              <li>Measure marketing effectiveness</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings, but
              disabling them may affect Service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">9. Third-Party Services</h2>
            <p>
              Our Service includes links to and integrations with third-party
              services:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>Stripe:</strong> Payment processing (
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Stripe Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Persona:</strong> Identity verification (
                <a href="https://persona.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Persona Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Resend:</strong> Email service (
                <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Resend Privacy Policy
                </a>
                )
              </li>
            </ul>
            <p className="mt-4">
              We are not responsible for third-party privacy practices. We
              encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">10. Verification Data</h2>
            <p>
              Your identity verification documents are processed by Persona and
              stored securely. We will:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                Delete documents after successful verification (unless required
                by law)
              </li>
              <li>Store verification status for trust and safety purposes</li>
              <li>Never share raw documents with other users</li>
              <li>
                Use verification status only to confirm compliance with age and
                identity requirements
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">11. Children's Privacy</h2>
            <p>
              VelvetHold is not intended for users under 18. We do not knowingly
              collect data from children. If we discover a child's data, we will
              delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">12. International Data Transfers</h2>
            <p>
              Your data may be transferred to and stored in the United States or
              other countries. By using the Service, you consent to such
              transfers. We implement safeguards to protect your data during
              transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes
              will be communicated via email or prominent notice on the Service.
              Your continued use of the Service constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">14. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data
              practices:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Email: privacy@velvethold.com</li>
              <li>Mail: VelvetHold, Legal Department, United States</li>
            </ul>
            <p className="mt-4">
              For GDPR requests, please contact our Data Protection Officer:
              dpo@velvethold.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">15. Your California Privacy Rights</h2>
            <p>
              California residents have specific rights under CCPA. To exercise
              your rights or for more information, contact us at:
              privacy@velvethold.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
