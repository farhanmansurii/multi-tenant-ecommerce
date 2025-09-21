import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Facebook, Instagram, Linkedin, Send, Twitter } from "lucide-react";
import { StoreData } from "@/lib/types/store";
import { ModeToggle } from "@/components/shared/common/theme-toggle";
import StoreFrontContainer from "./container";

export default function StoreFrontFooter({ store }: { store: StoreData }) {
  const footerContent = {
    newsletter: {
      title: store.businessName,
      description:
       store.tagline,
      placeholder: "Enter your email",
    },
    quickLinks: {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Products", href: "/products" },
        { label: "Contact", href: "/contact" },
      ],
    },
    contact: {
      title: "Contact Us",
      address: [
        store.businessName,
        store.addressLine1 || store.address || "",
        `${store.city}, ${store.state} ${store.zipCode}`,
        `Phone: ${store.contactPhone || "N/A"}`,
        `Email: ${store.contactEmail}`,
      ].filter(Boolean),
    },
    social: {
      title: "Follow Us",
      platforms: [
        {
          label: "Facebook",
          icon: Facebook,
          href: "#",
          tooltip: "Follow us on Facebook",
        },
        {
          label: "Twitter",
          icon: Twitter,
          href: "#",
          tooltip: "Follow us on Twitter",
        },
        {
          label: "Instagram",
          icon: Instagram,
          href: "#",
          tooltip: "Follow us on Instagram",
        },
        {
          label: "LinkedIn",
          icon: Linkedin,
          href: "#",
          tooltip: "Connect with us on LinkedIn",
        },
      ],
    },
    bottom: {
      copyright: `© ${new Date().getFullYear()} ${
        store.businessName || store.name
      }. All rights reserved.`,
      links: [
        { label: "Privacy Policy", href: store.privacyPolicy },
        { label: "Terms of Service", href: store.termsOfService },
        { label: "Refund Policy", href: store.refundPolicy },
      ],
    },
  };

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <StoreFrontContainer className='py-12'>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Newsletter */}
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              {footerContent.newsletter.title}
            </h2>
            <p className="mb-6 text-muted-foreground">
              {footerContent.newsletter.description}
            </p>

            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              {footerContent.quickLinks.title}
            </h3>
            <nav className="space-y-2 text-sm">
              {footerContent.quickLinks.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="block transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              {footerContent.contact.title}
            </h3>
            <address className="space-y-2 text-sm not-italic">
              {footerContent.contact.address.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </address>
          </div>

          {/* Social + Dark Mode */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">
              {footerContent.social.title}
            </h3>
            <div className="mb-6 flex space-x-4">
              {footerContent.social.platforms.map((platform, idx) => (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                      >
                        <a href={platform.href}>
                          <platform.icon className="h-4 w-4" />
                          <span className="sr-only">{platform.label}</span>
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{platform.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <ModeToggle />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            {footerContent.bottom.copyright}
          </p>
          <nav className="flex gap-4 text-sm">
            {footerContent.bottom.links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </StoreFrontContainer>
    </footer>
  );
}
