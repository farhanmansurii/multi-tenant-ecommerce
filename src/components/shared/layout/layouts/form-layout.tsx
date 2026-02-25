"use client";

import { ReactNode, useState, useEffect } from "react";
import { Loader2, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "../page-container";
import { PageHeader } from "../page-header";
import { PageContent } from "../page-content";
import { cn } from "@/lib/utils";

type Breadcrumb = {
  label: string;
  href?: string;
  active?: boolean;
};

interface FormLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  isSuccess?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
  showSavedMessage?: boolean;
}

export function FormLayout({
  title,
  description,
  icon,
  breadcrumbs,
  children,
  onSubmit,
  onCancel,
  isSaving = false,
  isSuccess = false,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  className,
  showSavedMessage = false,
}: FormLayoutProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const headerActions = (
    <div className="flex items-center gap-3">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          {cancelLabel}
        </Button>
      )}
      {onSubmit && (
        <Button
          type="submit"
          form="form-layout-form"
          disabled={isSaving}
          className={showSuccess ? "bg-success text-success-foreground hover:bg-success/90" : ""}
          onClick={onSubmit}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : showSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <PageContainer className={className}>
      {showSuccess && showSavedMessage && (
        <div className="sticky top-0 z-30 bg-success/15 border-b border-success/35 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-success-foreground">
            <Check className="w-5 h-5" />
            <span className="font-medium">Changes saved successfully!</span>
          </div>
        </div>
      )}

      <PageHeader
        title={title}
        description={description}
        icon={icon}
        breadcrumbs={breadcrumbs}
        headerActions={headerActions}
        sticky={showSuccess && showSavedMessage}
        className={cn(showSuccess && showSavedMessage && "mt-12")}
      />

      <PageContent>
        <form id="form-layout-form" className="space-y-8 pb-10">
          {children}
        </form>
      </PageContent>
    </PageContainer>
  );
}
