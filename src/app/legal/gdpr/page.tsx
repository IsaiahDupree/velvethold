import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR & Data Rights | VelvetHold",
  description: "Information about your data rights under GDPR, CCPA, and other regulations",
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Your Data Rights
          </h1>
          <p className="mt-4 text-sm text-gray-600">
            Information about GDPR, CCPA, and other privacy regulations
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">GDPR Rights (EU Users)</h2>
            <p>
              If you are located in the European Union, you have the following
              rights under the General Data Protection Regulation (GDPR):
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              1. Right to Access (Article 15)
            </h3>
            <p>
              You have the right to request access to your personal data. You can
              download your complete data export at any time from your account
              settings or by calling our data export API.
            </p>
            <p>
              <strong>How to exercise:</strong> Visit{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">/api/users/data-export</code> or
              contact privacy@velvethold.com
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              2. Right to Rectification (Article 16)
            </h3>
            <p>
              You can correct inaccurate or incomplete personal data. This includes
              your name, email, phone number, profile information, and preferences.
            </p>
            <p>
              <strong>How to exercise:</strong> Update your profile in settings, or
              use the data correction API at{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">/api/users/data-correction</code>
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              3. Right to Erasure (Article 17) - "Right to be Forgotten"
            </h3>
            <p>
              You can request deletion of your personal data. We will delete most
              data within 30 days, with exceptions for legal/regulatory
              requirements.
            </p>
            <p>
              <strong>How to exercise:</strong> Use the account deletion endpoint at{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">/api/users/delete</code> or
              email privacy@velvethold.com
            </p>
            <p>
              <strong>Exceptions:</strong> We retain transaction records for 7
              years (legal requirement), and may retain data if required by law.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              4. Right to Restrict Processing (Article 18)
            </h3>
            <p>
              You can restrict how we process your data while we review your
              request or dispute. Contact our Data Protection Officer for this
              request.
            </p>
            <p>
              <strong>How to exercise:</strong> Email dpo@velvethold.com with
              details of what you want restricted
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              5. Right to Data Portability (Article 20)
            </h3>
            <p>
              You can receive your data in a structured, commonly-used,
              machine-readable format (JSON) and transmit it to another service.
            </p>
            <p>
              <strong>How to exercise:</strong> Download your data export (JSON
              format) from{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">/api/users/data-export</code>
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              6. Right to Object (Article 21)
            </h3>
            <p>
              You can opt-out of marketing communications, profiling, and
              automated processing.
            </p>
            <p>
              <strong>How to exercise:</strong> Update communication preferences in
              settings, or email privacy@velvethold.com
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              7. Right to Not Be Subject to Automated Decision-Making (Article 22)
            </h3>
            <p>
              You have the right not to be subject to decisions based solely on
              automated processing that significantly affects you.
            </p>
            <p>
              <strong>Current Status:</strong> VelvetHold does not use fully
              automated decision-making for consequential decisions. All moderation
              and account decisions include human review.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              CCPA Rights (California Users)
            </h2>
            <p>
              If you are a California resident, you have the following rights
              under the California Consumer Privacy Act (CCPA):
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              1. Right to Know
            </h3>
            <p>
              You can request what personal information we collect, use, and
              share about you.
            </p>
            <p>
              <strong>How to exercise:</strong> Submit a request to
              privacy@velvethold.com or use our data export tool
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              2. Right to Delete
            </h3>
            <p>
              You can request deletion of personal information we have collected
              from you.
            </p>
            <p>
              <strong>How to exercise:</strong> Use the account deletion endpoint
              or contact privacy@velvethold.com
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              3. Right to Opt-Out of "Sale" of Personal Information
            </h3>
            <p>
              You can request that we not sell your personal information.
            </p>
            <p>
              <strong>Current Status:</strong> VelvetHold does not sell personal
              information. This right is not applicable.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              4. Right to Limit Use of Sensitive Personal Information
            </h3>
            <p>
              You can limit how we use sensitive personal information.
            </p>
            <p>
              <strong>How to exercise:</strong> Contact privacy@velvethold.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              Data Processing & Lawful Basis
            </h2>
            <p>
              Under GDPR, we process your data based on these lawful bases:
            </p>
            <ul className="mt-2 ml-6 space-y-2 list-disc">
              <li>
                <strong>Contract:</strong> Processing necessary to provide the
                Service (account, requests, payments)
              </li>
              <li>
                <strong>Legal Obligation:</strong> Compliance with laws,
                AML/KYC, dispute resolution
              </li>
              <li>
                <strong>Legitimate Interest:</strong> Safety, fraud prevention,
                service improvement
              </li>
              <li>
                <strong>Consent:</strong> Marketing, optional analytics
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              Data Retention Policy
            </h2>
            <table className="w-full border-collapse border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Data Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Retention Period
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Personal Profile Data
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Until deletion or 30 days after request
                  </td>
                  <td className="border border-gray-300 px-4 py-2">User control</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Photos & Media
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    30 days after account deletion
                  </td>
                  <td className="border border-gray-300 px-4 py-2">User control</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Transaction Records
                  </td>
                  <td className="border border-gray-300 px-4 py-2">7 years</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Tax/legal requirement
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Messages</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Anonymized on deletion
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Privacy protection
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Verification Documents
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Deleted after verification
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Minimal data retention
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Safety Reports
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Until case resolved + 1 year
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Safety & compliance
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              Data Protection Officer
            </h2>
            <p>
              For GDPR requests and data protection inquiries, contact our Data
              Protection Officer:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Email: dpo@velvethold.com</li>
              <li>
                Response time: Within 30 days for access requests, within 45 days
                for deletion requests
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              How to Submit Requests
            </h2>
            <ol className="mt-2 ml-6 space-y-2 list-decimal">
              <li>
                <strong>Data Export:</strong> Use your account settings or API
                endpoint{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">/api/users/data-export</code>
              </li>
              <li>
                <strong>Data Correction:</strong> Update profile in settings or use{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">/api/users/data-correction</code>
              </li>
              <li>
                <strong>Account Deletion:</strong> Use{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">/api/users/delete</code> or
                contact support
              </li>
              <li>
                <strong>Other Requests:</strong> Email privacy@velvethold.com or
                dpo@velvethold.com with your request
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              Regulatory Compliance
            </h2>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>GDPR (EU):</strong> Full compliance with data subject
                rights and processing requirements
              </li>
              <li>
                <strong>CCPA (California):</strong> Compliance with consumer privacy
                rights
              </li>
              <li>
                <strong>LGPD (Brazil):</strong> Compliance with data protection
                requirements
              </li>
              <li>
                <strong>ePrivacy Directive:</strong> Cookie consent and opt-out
                management
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">Questions?</h2>
            <p>
              If you have questions about your data rights or our compliance
              practices, contact us:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Privacy: privacy@velvethold.com</li>
              <li>Data Protection: dpo@velvethold.com</li>
              <li>Support: support@velvethold.com</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
