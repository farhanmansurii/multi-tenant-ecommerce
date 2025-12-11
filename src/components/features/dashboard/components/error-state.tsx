import Link from "next/link";
import { AlertTriangle, ArrowLeft, LayoutDashboard, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">

    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[100px]"></div>
    </div>

    <div className="relative z-10 max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">

      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-background border border-border/50 shadow-xl shadow-red-500/5 relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-50" />
        <ShieldAlert className="h-10 w-10 text-red-500/80" />

        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 border-2 border-background animate-pulse" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-balance leading-relaxed">
          {message}
        </p>
      </div>

      {showPermissionAlert && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-500">
              Permission Restricted
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/70 leading-relaxed">
              This action requires store owner privileges. Please contact the administrator or switch accounts.
            </p>
          </div>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
        {action ? (
          action
        ) : (
          <>
            <Button variant="outline" className="rounded-full h-11 px-6 border-border/50 hover:bg-muted/50" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button className="rounded-full h-11 px-6 shadow-lg shadow-red-500/10 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0" asChild>
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
);
