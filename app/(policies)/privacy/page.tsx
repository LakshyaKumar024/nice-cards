"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"


export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Card className="px-8 py-10 sm:px-12 sm:py-14">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Introduction */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to our Privacy Policy. Your privacy is critically important to us. This Privacy Policy document
                contains types of information that is collected and recorded by our service and how we use it.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you have additional questions or require more information about our Privacy Policy, do not hesitate
                to contact us. This Privacy Policy applies only to our online activities and is valid for visitors to
                our website with regards to the information that they shared and/or collect.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                The personal information that you are asked to provide, and the reasons why you are asked to provide 
                it, will be made clear at the point we request it. When you register for an account, we only ask for 
                basic details such as first name, last name, email address, and password. You may also choose to register
                using a third-party account (such as Google or Facebook), in which case we receive only the information 
                necessary to create and authenticate your account.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you contact us directly, we may receive additional information about you such as your name, email
                address, phone number, the contents of the message and/or attachments you may send us, and any other
                information you may choose to provide.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We also collect information about how you interact with our services, including your IP address, browser
                type, operating system, referring URLs, device information, pages viewed, and the dates/times of your
                visits.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect in various ways, including to provide, operate, and maintain our
                services, improve, personalize, and expand our services, understand and analyze how you use our
                services, and develop new products, services, features, and functionality.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We may also use your information to communicate with you, either directly or through one of our
                partners, including for customer service, to provide you with updates and other information relating to
                the service, and for marketing and promotional purposes.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside
                parties. This does not include trusted third parties who assist us in operating our website, conducting
                our business, or servicing you, so long as those parties agree to keep this information confidential.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We may also release your information when we believe release is appropriate to comply with the law,
                enforce our site policies, or protect ours or others&apos; rights, property, or safety.
              </p>
            </section>

            {/* Cookies and Tracking Technologies */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Like any other website, we use &quot;cookies&quot; to enhance user experience. These cookies are used to store
                information including visitors&apos; preferences, and the pages on the website that the visitor accessed or
                visited. The information is used to optimize the users&apos; experience by customizing our web page content
                based on visitors&apos; browser type and/or other information.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can choose to disable cookies through your individual browser options. To know more detailed
                information about cookie management with specific web browsers, it can be found at the browsers&apos;
                respective websites.
              </p>
            </section>

            {/* Data Security */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement a variety of security measures to maintain the safety of your personal information when you
                enter, submit, or access your personal information. We use secure server connections and encrypt
                sensitive data during transmission using industry-standard SSL/TLS protocols.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                While we strive to use commercially acceptable means to protect your personal information, we cannot
                guarantee its absolute security.
              </p>
            </section>

            {/* Your Rights and Choices */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to access, update, or delete your personal information at any time. You may also have
                the right to restrict or object to certain processing of your data, and the right to data portability.
                To exercise these rights, please contact us using the information provided below.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can opt out of receiving promotional communications from us at any time by following the
                instructions in those messages or by contacting us directly. If you opt out, we may still send you
                non-promotional communications, such as those about your account or our ongoing business relations.
              </p>
            </section>

            {/* Changes to This Privacy Policy */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the &quot;Last updated&quot; date at the bottom of this Privacy Policy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
                Policy are effective when they are posted on this page.
              </p>
            </section>

            {/* Contact Us */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us by :-</p>
                <div className="mt-3 text-sm text-muted-foreground">
                <p>
                  Email: 
                  <Link href="https://mail.google.com/mail/?view=cm&fs=1&to=nicecardramgarh@gmail.com" className="hover:underline"> nicecardramgarh@gmail.com</Link>
                </p>
                <p>Phone: +917764839112</p>
                <p>Address: Ramgarh, Jharkhand, India</p>
              </div>
            </section>

            {/* Last Updated */}
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">Last updated: January 2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}