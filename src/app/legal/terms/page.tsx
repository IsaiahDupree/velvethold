import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | VelvetHold",
  description: "Terms of Service for VelvetHold dating platform",
};

export default function TermsOfService() {
  const lastUpdated = "January 2026";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">1. Agreement to Terms</h2>
            <p>
              By accessing and using VelvetHold ("the Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on VelvetHold for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Modifying or copying the materials</li>
              <li>
                Using the materials for any commercial purpose or for any public
                display
              </li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Removing any copyright or other proprietary notations</li>
              <li>Transferring the materials to another person or "mirroring" the materials</li>
              <li>Violating any laws or regulations in your jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">3. Age Requirement</h2>
            <p>
              You must be at least 18 years old to use VelvetHold. By creating
              an account and using the Service, you represent and warrant that:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>You are at least 18 years of age</li>
              <li>You have the legal authority to enter into this agreement</li>
              <li>You are not a registered sex offender</li>
              <li>You will comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account information and password and for restricting access to
              your computer. You agree to accept responsibility for all
              activities that occur under your account. You must notify us
              immediately of any unauthorized uses of your account.
            </p>
            <p>
              VelvetHold reserves the right to refuse service, terminate
              accounts, or remove or edit content in its sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">5. Deposits and Refunds</h2>
            <p>
              VelvetHold facilitates refundable deposits through Stripe to
              demonstrate commitment to date requests. Understanding and
              agreeing to our deposit terms is mandatory:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>
                <strong>Deposit Purpose:</strong> Deposits are held in escrow to
                ensure accountability for both parties
              </li>
              <li>
                <strong>Refund Policy:</strong> Refunds are processed according
                to the invitee's stated cancellation policy
              </li>
              <li>
                <strong>Automatic Refunds:</strong> When both parties confirm
                date completion, deposits are automatically refunded within 30
                minutes
              </li>
              <li>
                <strong>Declined Requests:</strong> When an invitee declines a
                request, deposits are immediately refunded
              </li>
              <li>
                <strong>No-Show Policy:</strong> Deposits may be retained
                according to the invitee's stated policy if a requester
                no-shows
              </li>
              <li>
                <strong>Processing Fees:</strong> Stripe transaction fees (2.9% +
                $0.30) are non-refundable
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">6. Prohibited Conduct</h2>
            <p>You agree not to engage in any of the following conduct:</p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Harassment, threatening, or abusive language toward other users</li>
              <li>Impersonation of another person or entity</li>
              <li>Creating multiple accounts to circumvent restrictions</li>
              <li>
                Posting sexually explicit, offensive, or illegal content or
                photos
              </li>
              <li>Soliciting or engaging in commercial activities</li>
              <li>Sharing contact information without consent</li>
              <li>Attempting to interfere with the functioning of the Service</li>
              <li>Violating any applicable laws or regulations</li>
              <li>Catfishing or deceiving other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">7. Safety & Responsibility</h2>
            <p>
              VelvetHold is a platform connecting individuals for dating. We are
              not responsible for:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>The conduct of users or third parties</li>
              <li>Injuries, losses, or damages resulting from dates</li>
              <li>Disputes between users regarding dates or deposits</li>
              <li>Identity verification accuracy beyond our reasonable efforts</li>
            </ul>
            <p className="mt-4">
              <strong>Your Responsibility:</strong> You agree to meet users in
              safe, public locations and to take reasonable precautions for your
              personal safety. Report suspicious activity immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">8. Verification & Identity</h2>
            <p>
              VelvetHold uses third-party verification services (Persona) to
              verify identity. By using the Service, you:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Consent to identity verification</li>
              <li>Agree to provide accurate identification documents</li>
              <li>Understand that misrepresentation may result in account suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">9. Content Rights</h2>
            <p>
              By posting content (photos, messages, profile information) on
              VelvetHold, you grant us a non-exclusive, worldwide, royalty-free
              license to use, reproduce, and display such content for the
              purpose of providing the Service.
            </p>
            <p>
              You retain all rights to your content and may delete it at any
              time. Upon account deletion, we will remove your content within 30
              days, except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">10. Limitation of Liability</h2>
            <p>
              VELVETHOLD AND ITS SUPPLIERS AND LICENSORS MAKE NO WARRANTIES
              ABOUT THE MATERIALS, INFORMATION, AND RELATED GRAPHICS CONTAINED
              IN VELVETHOLD OR ITS ACCURACY. IN NO EVENT SHALL VELVETHOLD OR ITS
              SUPPLIERS BE LIABLE FOR ANY DAMAGES (INCLUDING, WITHOUT LIMITATION,
              DIRECT, INDIRECT, PUNITIVE, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR
              EXEMPLARY DAMAGES) ARISING OUT OF OR RELATING TO THESE TERMS OR
              YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless VelvetHold and
              its officers, directors, employees, agents, licensors, suppliers,
              and service providers from and against all losses, expenses, damages,
              and costs, including reasonable attorneys' fees, relating to any
              allegation, claim, action, demand, assertion, or judgment arising
              from or concerning your use of the Service or violation of these
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">12. Dispute Resolution</h2>
            <p>
              Any disputes arising from or relating to your use of VelvetHold or
              these Terms shall be resolved through binding arbitration, except
              where prohibited by law. By using the Service, you waive your right
              to a jury trial and class action lawsuit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">13. Modifications to Service</h2>
            <p>
              VelvetHold reserves the right to modify or discontinue the Service
              at any time, with or without notice. We are not liable for any
              modifications, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">14. Termination</h2>
            <p>
              VelvetHold may suspend or terminate your account and access to the
              Service at any time, for any reason, including:
            </p>
            <ul className="mt-2 ml-6 space-y-1 list-disc">
              <li>Violation of these Terms</li>
              <li>Illegal activity</li>
              <li>Harassment or abuse of other users</li>
              <li>Non-compliance with verification requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">15. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in
              accordance with the laws of the United States, and you
              irrevocably submit to the exclusive jurisdiction of the courts
              located in that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">16. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at legal@velvethold.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
