"use client";

import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  AlertTitle,
  AlertDescription,
  LoadingPage,
  Heading,
  Text,
} from "@repo/ui";
import { Shield, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function UITestPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  if (isLoading) {
    return (
      <LoadingPage
        text="Testing Loading Page..."
        fullScreen={true}
        className="cursor-pointer"
        onClick={() => setIsLoading(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-12 pb-20">
      <section className="space-y-4">
        <Heading variant="h1">UI Style Guide & Components</Heading>
        <Text variant="lead">
          Explore the reusable components created in <code>@repo/ui</code> to ensure consistency across the application.
        </Text>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <Heading variant="h2" className="border-b pb-2">Typography</Heading>
        <div className="grid gap-4">
          <Heading variant="h1">Heading 1 (H1)</Heading>
          <Heading variant="h2">Heading 2 (H2)</Heading>
          <Heading variant="h3">Heading 3 (H3)</Heading>
          <Heading variant="h4">Heading 4 (H4)</Heading>
          <Text variant="default">Default body text (P)</Text>
          <Text variant="sm">Small body text</Text>
          <Text variant="muted">Muted/Secondary text</Text>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <Heading variant="h2" className="border-b pb-2">Buttons</Heading>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Alerts */}
      <section className="space-y-4">
        <Heading variant="h2" className="border-b pb-2">Alerts</Heading>
        <div className="grid gap-4 max-w-2xl">
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is a default alert for general information.
            </AlertDescription>
          </Alert>
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully.
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please review your settings before proceeding.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              An error occurred while processing your request.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <Heading variant="h2" className="border-b pb-2">Cards</Heading>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>A reusable card component for consistent layouts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Text>
                Cards are the foundation of our dashboard UI. They help group related information and actions together.
              </Text>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card className="bg-muted/50 border-dashed">
            <CardHeader>
              <CardTitle>Secondary/Muted Card</CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="sm">
                This card uses a background utility class for a different look, while still using the shared <code>Card</code> layout.
              </Text>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <Heading variant="h2" className="border-b pb-2">Loading States</Heading>
        <div className="space-y-4">
          <Text>Click the button below to see the full-screen LoadingPage component.</Text>
          <Button onClick={() => setIsLoading(true)}>Show Loading Page</Button>
        </div>
      </section>
    </div>
  );
}
