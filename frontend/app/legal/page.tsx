import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Legal Information</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              By using this Medical Exam Preparation Platform, you agree to comply with and be bound by the following
              terms and conditions. Please review these terms carefully.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">1. Acceptance of Terms</h3>
            <p>
              Your access to and use of this platform is subject to these Terms of Service and all applicable laws and
              regulations.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">2. Use License</h3>
            <p>
              Permission is granted to temporarily access the materials on this platform for personal, non-commercial
              transitory viewing only.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">3. User Accounts</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>How we handle your data</CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and
              safeguard your information.
            </p>
            <h3 className="text-xl font-semibold mt-4 mb-2">Information We Collect</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Account registration information (name, email)</li>
              <li>Practice session data and performance metrics</li>
              <li>Usage analytics and interaction data</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4 mb-2">How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Provide and improve our services</li>
              <li>Personalize your learning experience</li>
              <li>Communicate with you about your account</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookie Policy</CardTitle>
            <CardDescription>Our use of cookies</CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              We use httpOnly cookies to maintain your authentication session. These cookies are essential for the
              platform to function and are not accessible via JavaScript for security purposes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

