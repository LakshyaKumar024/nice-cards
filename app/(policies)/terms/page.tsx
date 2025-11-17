"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Card className="px-8 py-10 sm:px-12 sm:py-14">
          <h1 className="mb-8 text-4xl font-semibold text-foreground">Terms and Conditions</h1>

          <div className="space-y-8 text-foreground">
            {/* Introduction */}
            <section>
              <h2 className="mb-3 text-xl font-semibold">Introduction</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Welcome to our website. By accessing and using this website, you accept and agree to be bound by the
                terms and provision of this agreement. If you do not agree to abide by the above, please do not use this
                service. These Terms and Conditions govern your use of our website and services. Please read them
                carefully before proceeding.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="mb-3 text-xl font-semibold">Intellectual Property</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                All content included on this site, such as text, graphics, logos, images, templates, SVG files, digital
                downloads, and software, is the property of our company or its content suppliers and is protected by
                international copyright laws. The compilation of all content on this site is the exclusive property of
                our company and is protected by international copyright laws.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="mb-3 text-xl font-semibold">User Responsibilities</h2>
              <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                As a user of this website, you agree to use our services only for lawful purposes and in a way that does
                not infringe the rights of, restrict, or inhibit anyone else&apos;s use and enjoyment of the website. You are
                responsible for:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-sm text-muted-foreground">
                <li>Maintaining the confidentiality of your account and password</li>
                <li>Restricting access to your computer to prevent unauthorized access to your account</li>
                <li>Ensuring that all information you provide is accurate, current, and complete</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            {/* Payments & Subscriptions */}
            <section>
              <h2 className="mb-3 text-xl font-semibold">Payments & Subscriptions</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you purchase any services or products through our website, you agree to provide current, complete,
                and accurate purchase and account information for all purchases. You agree to promptly update your
                account and payment information, including email address, payment method, and payment card expiration
                date, so that we can complete your transactions and contact you as needed. All fees are non-refundable
                unless otherwise stated. You can make payments using the payment methods such as credit/debit cards , upi , netbanking or other.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="mb-3 text-xl font-semibold">Limitation of Liability</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                In no event shall our company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other
                intangible losses, resulting from your access to or use of, or inability to access or use, the service. We do not warrant that the service
                will be uninterrupted, timely, secure, or error-free. Additionally, any template download links provided through the service will remain 
                active for 24 hours from the time of generation. After the link expires, you may be required to regenerate or edit the template again to 
                obtain a new download link. We are not liable for any loss, inconvenience, or inability to retrieve templates after the expiration period.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="mb-3 text-xl font-semibold">Termination</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
                not limited to a breach of these Terms. If you wish to terminate your account, you may simply
                discontinue using the service. All provisions of these Terms which by their nature should survive
                termination shall survive termination, including, without limitation, ownership provisions, warranty
                disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            {/* Changes to These Terms */}
            <section>
              <h2 className="mb-3 text-xl font-semibold">Changes to These Terms</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision
                is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole discretion. By continuing to access or use
                our service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="mb-3 text-xl font-semibold">Contact Information</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
            <div className="mt-3 text-sm text-muted-foreground">
                <p>
                  Email: 
                  <Link href="https://mail.google.com/mail/?view=cm&fs=1&to=nicecardramgarh@gmail.com" className="hover:underline"> nicecardramgarh@gmail.com</Link>
                </p>
                <p>Phone: +917764839112</p>
                <p>Address: Ramgarh, Jharkhand, India</p>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">Last updated: January 2025</p>
          </div>
        </Card>
      </div>
    </div>
  )
}