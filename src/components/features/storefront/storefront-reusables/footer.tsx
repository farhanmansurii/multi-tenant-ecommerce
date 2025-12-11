import * as React from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  Store
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/shared/common/theme-toggle";
import StoreFrontContainer from "./container";
import { StoreData } from "@/lib/domains/stores/types";
import { cn } from "@/lib/utils";

export default function StoreFrontFooter({ store }: { store: StoreData }) {
  const currentYear = new Date().getFullYear();

  // Social Media Configuration
  const socialLinks = [
    { label: "Facebook", icon: Facebook, href: "#" },
    { label: "Twitter", icon: Twitter, href: "#" },
    { label: "Instagram", icon: Instagram, href: "#" },
    { label: "LinkedIn", icon: Linkedin, href: "#" },
  ];

  // Footer Navigation Sections
  const footerSections = [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/products" },
        { label: "New Arrivals", href: "/products?sort=newest" },
        { label: "Featured", href: "/products?featured=true" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "Shipping Policy", href: "/shipping" },
        { label: "Returns & Exchanges", href: "/returns" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: store.privacyPolicy || "#" },
        { label: "Terms of Service", href: store.termsOfService || "#" },
        { label: "Refund Policy", href: store.refundPolicy || "#" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-border/40 bg-background text-foreground overflow-hidden">

      {/* 1. Background Texture (Matches Hero/Loader) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute right-0 bottom-0 h-[300px] w-[300px] bg-primary/5 blur-[100px] rounded-full"></div>
      </div>

      <StoreFrontContainer className="relative z-10 py-16">

        {/* --- Top Section: Brand & Newsletter --- */}
        <div className="grid gap-12 lg:grid-cols-2 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
              </div>
              {store.businessName || store.name}
            </div>
            <p className="max-w-md text-muted-foreground leading-relaxed">
              {store.tagline || "Discover quality products curated just for you. Join our community and elevate your lifestyle today."}
            </p>

            <div className="flex items-center gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Secure Payment
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Verified Merchant
              </div>
            </div>
          </div>

          <div className="lg:pl-12">
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 md:p-8 backdrop-blur-sm">
              <h3 className="mb-2 text-lg font-semibold">Subscribe to our newsletter</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get the latest updates, exclusive offers, and early access to new products.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your email"
                  className="bg-background border-border/60 focus-visible:ring-primary/20"
                />
                <Button>
                  Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-border/60 mb-12" />

        {/* --- Middle Section: Links & Contact --- */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">

          {/* Dynamic Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 font-semibold tracking-wide text-foreground">{section.title}</h3>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 font-semibold tracking-wide text-foreground">Contact</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-primary/60" />
                <span>
                  {store.addressLine1 || store.address} <br />
                  {store.city && `${store.city}, `} {store.state} {store.zipCode}
                </span>
              </li>
              {store.contactEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-primary/60" />
                  <a href={`mailto:${store.contactEmail}`} className="hover:text-primary transition-colors">
                    {store.contactEmail}
                  </a>
                </li>
              )}
              {store.contactPhone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-primary/60" />
                  <a href={`tel:${store.contactPhone}`} className="hover:text-primary transition-colors">
                    {store.contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* --- Bottom Section: Social & Copyright --- */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {store.businessName || store.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {/* Social Icons */}
            <div className="flex gap-2">
              {socialLinks.map((platform) => (
                <TooltipProvider key={platform.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
                        asChild
                      >
                        <Link href={platform.href}>
                          <platform.icon className="h-4 w-4" />
                          <span className="sr-only">{platform.label}</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{platform.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <ModeToggle />
          </div>
        </div>
      </StoreFrontContainer>
    </footer>
  );
}
