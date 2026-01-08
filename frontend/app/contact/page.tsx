import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Contact & Support</h1>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
            <CardDescription>Get help via email</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              For general inquiries, technical support, or account assistance, please email us:
            </p>
            <p className="font-medium">support@examprep.com</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We typically respond within 24-48 hours.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help Center
            </CardTitle>
            <CardDescription>Find answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Check our help center for frequently asked questions and troubleshooting guides.
            </p>
            <Button variant="outline" className="w-full">
              Visit Help Center
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send us a Message
          </CardTitle>
          <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="What is this regarding?" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us how we can help..."
                rows={6}
                className="resize-none"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Note: This is a placeholder form. In production, this would connect to a support
              ticket system.
            </p>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Office Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Monday - Friday:</span> 9:00 AM - 5:00 PM (EST)
            </p>
            <p>
              <span className="font-medium">Saturday - Sunday:</span> Closed
            </p>
            <p className="mt-4 text-muted-foreground">
              For urgent technical issues outside of office hours, please email us and we'll
              prioritize your request.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
