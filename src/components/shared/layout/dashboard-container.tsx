/* eslint-disable @next/next/no-img-element */
import React, { ReactNode } from 'react';
import { Image as ImageIcon } from 'lucide-react';

type Breadcrumb = {
  label: string;
  href?: string;
};

type DashboardLayoutProps = {
  title?: string;
  desc?: string;
  image?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerActions?: ReactNode;
  bottomActions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  children: ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  desc,
  image,
  icon,
  headerActions,
  bottomActions,
  breadcrumbs,
  children
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {(title || desc || image || icon || headerActions || bottomActions || breadcrumbs) && (
          <div className="space-y-4">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-foreground font-medium">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <span className="text-muted-foreground/50">/</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full ring-2 ring-border flex items-center justify-center bg-muted">
                  {image ? (
                    <img
                      src={image}
                      alt={title || "Page"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : icon ? (
                    React.createElement(icon, { className: "h-6 w-6 text-muted-foreground" })
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  {title && (
                    <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                  )}
                  {desc && (
                    <p className="text-lg text-muted-foreground mt-1">{desc}</p>
                  )}
                </div>
              </div>
              {headerActions && (
                <div className="flex items-center space-x-2">
                  {headerActions}
                </div>
              )}
            </div>

            {bottomActions && (
              <div className="flex items-center space-x-2 pt-2">
                {bottomActions}
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
