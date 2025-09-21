import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorStateProps {
  title: string;
  message: string;
  showPermissionAlert?: boolean;
}

export const ErrorState = ({
  title,
  message,
  showPermissionAlert = false
}: ErrorStateProps) => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-red-600">{title}</CardTitle>
        <CardDescription className="text-center">{message}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {showPermissionAlert && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Only the store owner can manage this product.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2 justify-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/stores">View Stores</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
