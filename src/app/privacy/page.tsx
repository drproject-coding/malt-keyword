import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Malt Keyword Tool",
  description:
    "Learn how we collect, use, and protect your email data. GDPR-compliant privacy policy for the Malt Keyword Tool.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-600">Last updated: March 2026</p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="mb-4 text-gray-700">
            At Malt Keyword Tool, we take your privacy seriously. This privacy
            policy explains what data we collect, why we collect it, who has
            access to it, and what rights you have.
          </p>
          <p className="text-gray-700">
            We are committed to GDPR compliance and transparent data handling.
            If you have any questions about this policy, please contact us at
            the email address provided below.
          </p>
        </section>

        {/* 1. What We Collect */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            1. What We Collect
          </h2>
          <p className="mb-4 text-gray-700">
            When you use the Malt Keyword Tool, we collect the following
            information:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li className="mb-2">
              <strong>Email address</strong> (required) — to send you updates
              and verify your subscription
            </li>
            <li className="mb-2">
              <strong>Name</strong> (optional) — to personalize our
              communications
            </li>
            <li className="mb-2">
              <strong>Search activity</strong> (internal only) — to understand
              how you use the tool and improve it
            </li>
          </ul>
          <p className="text-gray-700">
            We do not collect cookies for tracking purposes. We use only
            essential cookies for basic functionality.
          </p>
        </section>

        {/* 2. How We Use Your Data */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            2. How We Use Your Data
          </h2>
          <p className="mb-4 text-gray-700">We use your email address to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li className="mb-2">
              Send you occasional updates about the Malt Keyword Tool, feature
              releases, and improvements
            </li>
            <li className="mb-2">
              Send you verification emails when you first subscribe
            </li>
            <li className="mb-2">
              Monitor engagement with the tool (e.g., how often you search)
            </li>
            <li className="mb-2">
              Comply with legal obligations (e.g., respond to lawful requests)
            </li>
          </ul>
          <p className="text-gray-700">
            We will never sell your email address to third parties. We will
            never send you marketing emails from other companies.
          </p>
        </section>

        {/* 3. Legal Basis */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            3. Legal Basis for Processing
          </h2>
          <p className="mb-4 text-gray-700">
            Under GDPR, we process your email based on your{" "}
            <strong>explicit consent</strong>. When you submit your email
            address, you see a checkbox confirming:
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700">
            "I agree to receive occasional updates about the Malt Keyword Tool"
          </blockquote>
          <p className="text-gray-700">
            This consent is <strong>not pre-ticked</strong> — you must
            explicitly opt in. You can withdraw your consent anytime by
            unsubscribing.
          </p>
        </section>

        {/* 4. Who Has Access to Your Data */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. Who Has Access to Your Data
          </h2>
          <p className="mb-4 text-gray-700">
            Your email address is shared with:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li className="mb-2">
              <strong>Resend</strong> — our email service provider. Resend
              handles sending emails and managing unsubscribe links. Resend
              complies with GDPR and maintains SOC 2 Type II certification.
              <br />
              <span className="text-sm">
                Learn more:{" "}
                <Link
                  href="https://resend.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Resend Privacy Policy
                </Link>
              </span>
            </li>
          </ul>
          <p className="text-gray-700">
            We do not share your data with any other third parties (e.g.,
            analytics vendors, advertisers, or data brokers).
          </p>
        </section>

        {/* 5. How Long We Keep Your Data */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. Data Retention
          </h2>
          <p className="mb-4 text-gray-700">We keep your email address:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li className="mb-2">
              <strong>Until you unsubscribe</strong> — Click the "Unsubscribe"
              link in any email from us, and your email is immediately deleted
              from our list and Resend's system.
            </li>
            <li className="mb-2">
              <strong>For 12 months</strong> if you don't receive any emails
              from us — We automatically delete inactive emails after 12 months
              of inactivity (v1 policy).
            </li>
            <li className="mb-2">
              <strong>Upon request</strong> — Email us to request immediate
              deletion of your data.
            </li>
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            <em>
              Note: This is a v1 policy and may be updated. Changes to retention
              policy will be announced via email.
            </em>
          </p>
        </section>

        {/* 6. Your Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. Your Rights
          </h2>
          <p className="mb-4 text-gray-700">
            Under GDPR, you have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li className="mb-2">
              <strong>Unsubscribe anytime</strong> — Click the "Unsubscribe"
              link at the bottom of any email. You will be immediately removed
              from our mailing list with no questions asked.
            </li>
            <li className="mb-2">
              <strong>Request deletion</strong> — Email us to request that we
              delete all data associated with your email address. We will comply
              within 30 days.
            </li>
            <li className="mb-2">
              <strong>Access your data</strong> — Request a copy of the data we
              store about you. We only store your email address and optional
              name.
            </li>
            <li className="mb-2">
              <strong>Data portability</strong> — Request your data in a
              portable format (e.g., CSV).
            </li>
            <li className="mb-2">
              <strong>Object to processing</strong> — You can ask us to stop
              processing your data at any time.
            </li>
          </ul>
          <p className="text-gray-700">
            To exercise any of these rights, contact us using the email address
            below.
          </p>
        </section>

        {/* 7. Contact */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Contact Us
          </h2>
          <p className="mb-4 text-gray-700">
            For privacy questions, data requests, or to exercise your rights:
          </p>
          <ul className="list-none pl-0 text-gray-700">
            <li className="mb-2">
              <strong>Email:</strong>{" "}
              <Link
                href="mailto:privacy@maltkeywortool.com"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                privacy@maltkeywortool.com
              </Link>
            </li>
            <li className="mb-2">
              <strong>Response time:</strong> 30 days (per GDPR standard)
            </li>
          </ul>
          <p className="mt-4 text-gray-700">
            For Resend-specific privacy questions:
          </p>
          <ul className="list-none pl-0 text-gray-700">
            <li className="mb-2">
              <strong>Resend Support:</strong>{" "}
              <Link
                href="https://resend.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                https://resend.com/contact
              </Link>
            </li>
          </ul>
        </section>

        {/* 8. Legal Review Notice */}
        <section className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            8. Legal Review Notice
          </h2>
          <p className="text-gray-700">
            This privacy policy is a v1 best-effort document created to
            establish transparency and GDPR compliance for the Malt Keyword
            Tool. It will be reviewed by an EU data protection lawyer before the
            tool is publicly launched.
          </p>
          <p className="mt-4 text-gray-700">
            We prioritize user privacy and are committed to maintaining the
            highest standards of data protection. If you have concerns about
            compliance, please contact us immediately.
          </p>
        </section>

        {/* Footer with links */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Other important pages:</p>
          <ul className="list-none pl-0 space-y-2">
            <li>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Back to Keyword Search
              </Link>
            </li>
            <li>
              <Link
                href="https://resend.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Resend Privacy Policy
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
