import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  CheckCircle2,
  Star,
  TrendingUp,
  Zap,
  CreditCard,
  Globe,
  ShieldCheck,
  Menu
} from 'lucide-react'


const LogoStrip = () => (
  <div className="mt-12 pt-8 border-t border-border/40">
    <p className="text-sm font-medium text-muted-foreground text-center mb-6">
      Empowering creators who previously worked at
    </p>
    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
      {/* Using text for demo purposes, replace with SVG logos */}
      {['Spotify', 'Notion', 'Figma', 'Stripe', 'Discord'].map((brand) => (
        <span key={brand} className="text-xl font-bold font-sans tracking-tight text-foreground/80">{brand}</span>
      ))}
    </div>
  </div>
)

const FloatingWidget = ({ icon: Icon, title, subtitle, value, className, delay }: any) => (
  <div className={`absolute z-20 bg-background/80 backdrop-blur-md border border-white/20 shadow-2xl rounded-xl p-4 flex items-center gap-4 min-w-[200px] animate-in fade-in zoom-in-95 duration-700 ${className}`} style={{ animationDelay: delay }}>
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-foreground">{value}</span>
        {subtitle && <span className="text-xs text-green-500 font-medium">{subtitle}</span>}
      </div>
    </div>
  </div>
)



export default function HeroSection() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-foreground relative selection:bg-purple-500/30">

      {/* Background Texture & Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-400 opacity-10 blur-[120px]"></div>
      </div>

      <main className="relative z-10 pt-16 md:pt-24 pb-20">
        <div className="container px-4 mx-auto">

          {/* Hero Text Content */}
          <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">

            {/* Pill Badge */}
            <div className="inline-flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link
                href="/updates"
                className="group flex items-center gap-2 rounded-full border border-black/5 bg-white/50 dark:bg-white/5 px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-white/80 transition-all shadow-sm backdrop-blur-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                <span>V2.0 is live: Multi-currency support</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 pb-2">
              Sell anything,<br />
              <span className="text-foreground">keep everything.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
              The platform for creators to sell digital products, courses, and memberships. No monthly fees, just a small cut when you win.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 bg-[#000] text-white hover:bg-gray-800 dark:bg-white dark:text-black">
                Start Selling for Free
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-transparent border-2 hover:bg-muted/50">
                View Demo Store
              </Button>
            </div>

            {/* Reviews Mini-Widget */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gray-200 overflow-hidden">
                    {/* <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}`} width={32} height={32} alt="avatar" /> */}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">4.9/5</span>
                <span>from 10k+ creators</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Section */}
          <div className="relative max-w-6xl mx-auto mt-12 md:mt-20 perspective-1000">

            {/* Floating Widgets (Left) */}
            <FloatingWidget
              icon={CreditCard}
              title="Total Revenue"
              value="$124,500.00"
              subtitle="+12%"
              className="top-20 -left-4 md:-left-12 hidden md:flex"
              delay="200ms"
            />

            {/* Floating Widgets (Right) */}
            <FloatingWidget
              icon={TrendingUp}
              title="Active Subscribers"
              value="2,403"
              subtitle="Just now"
              className="bottom-32 -right-4 md:-right-12 hidden md:flex"
              delay="500ms"
            />

            {/* Main Dashboard Image */}
            <div className="relative z-10 rounded-2xl border border-white/20 bg-white/50 dark:bg-black/40 backdrop-blur-xl p-2 md:p-4 shadow-2xl ring-1 ring-black/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-2xl"></div>

              {/* Browser Header */}
              <div className="h-10 border-b border-black/5 dark:border-white/5 flex items-center px-4 gap-2 mb-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="mx-auto bg-black/5 dark:bg-white/10 h-6 w-1/2 rounded-md flex items-center justify-center text-[10px] text-muted-foreground font-medium font-mono">
                  trykiosk.com/dashboard
                </div>
              </div>

              {/* Actual Image Placeholder */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted border border-black/5">
                <Image
                  src="/stores/dashboard-preview.png" // Replace with your image
                  alt="Dashboard"
                  fill
                  className="object-cover object-top"
                  priority
                />

                {/* Overlay Gradient for Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
              </div>
            </div>

            {/* Glow Behind Image */}
            <div className="absolute -inset-10 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 blur-3xl -z-10 opacity-50 rounded-[3rem]"></div>
          </div>

          <LogoStrip />

          {/* Features Grid Teaser */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
            {[
              { icon: Globe, title: "Global Payments", desc: "Accept payments in 135+ currencies without the headache." },
              { icon: ShieldCheck, title: "Fraud Protection", desc: "Automated chargeback protection and VAT handling." },
              { icon: Zap, title: "Instant Payouts", desc: "Get paid daily. No holding periods for established creators." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/30 border border-transparent hover:border-border/50 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-background shadow-sm border flex items-center justify-center mb-4 text-indigo-600">
                  <feature.icon />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
