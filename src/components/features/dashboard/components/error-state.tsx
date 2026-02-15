import Link from "next/link";
import { AlertTriangle, ArrowLeft, LayoutDashboard, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateProps {
  title: string;
  message: string;
  showPermissionAlert?: boolean;
  action?: React.ReactNode;
}

export const ErrorState = ({
  title,
  message,
  showPermissionAlert = false,
  action
}: ErrorStateProps) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
    <div className="max-w-md w-full space-y-6">
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-lg font-semibold leading-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>

      {showPermissionAlert && (
        <Alert className="border-border/50 bg-card/60">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Permission Restricted</AlertTitle>
          <AlertDescription>
            This action requires store owner privileges. Please contact the administrator or switch accounts.
          </AlertDescription>
        </Alert>
      )}

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        {action ? (
          action
        ) : (
          <>
            <Button variant="outline" className="h-11" asChild>
              <Link href="/dashboard/stores">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Stores
              </Link>
            </Button>
            <Button className="h-11" asChild>
              <Link href="/dashboard/stores">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Switch Store
              </Link>
            </Button>
          </>
        )}
      </div>
      </div>
    </div>
  </div>
);
