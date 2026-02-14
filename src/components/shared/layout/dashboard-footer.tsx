import Link from "next/link";
import { Shield, LifeBuoy, FileText } from "lucide-react";

export const DashboardFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-border/40 bg-background/80 px-4 py-6 text-sm text-muted-foreground md:px-6 lg:px-8">
      <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/80">
            Kiosk
          </div>
          <div className="text-sm text-foreground/90">
            Multi-tenant commerce dashboard
          </div>
          <div className="text-xs text-muted-foreground">
            © {year} Kiosk. Built for operators, not demos.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm md:grid-cols-3">
          <Link href="/privacy" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
            <Shield className="h-4 w-4" />
            Privacy
          </Link>
          <Link href="/terms" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
            <FileText className="h-4 w-4" />
            Terms
          </Link>
          <Link href="/help" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
            <LifeBuoy className="h-4 w-4" />
            Help
          </Link>
          <span className="col-span-2 text-xs text-muted-foreground md:col-span-3">
            Made by Farhan Mansuri
          </span>
        </div>
      </div>
    </footer>
  );
};
