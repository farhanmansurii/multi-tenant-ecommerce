'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion' // standard package name
import {
  Store,
  ShoppingBag,
  Settings,
  BarChart3,
  Users,
  Palette,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Data structure
const features = [
  {
    id: 'item-1',
    title: "Customizable Storefronts",
    description: "Your brand, your rules. Switch themes, adjust colors, and map custom domains in seconds.",
    icon: Palette,
    color: "bg-pink-500",
    image: '/charts.png', // Kept your paths
  },
  {
    id: 'item-2',
    title: "Inventory & Products",
    description: "Sell digital files, physical goods, or subscriptions. Bulk import and real-time stock tracking included.",
    icon: ShoppingBag,
    color: "bg-blue-500",
    image: '/music.png',
  },
  {
    id: 'item-3',
    title: "Advanced Settings",
    description: "Granular control over taxes, shipping rates, email notifications, and team permissions.",
    icon: Settings,
    color: "bg-orange-500",
    image: '/mail2.png',
  },
  {
    id: 'item-4',
    title: "Real-time Analytics",
    description: "Visualize your revenue, conversion rates, and traffic sources without needing a data scientist.",
    icon: BarChart3,
    color: "bg-green-500",
    image: '/payments.png',
  },
  {
    id: 'item-5',
    title: "Seamless Checkout",
    description: "Optimized for conversion. One-click payments with Apple Pay, Google Pay, and global currency support.",
    icon: Users,
    color: "bg-purple-500",
    image: '/checkout.png',
  },
]

export default function Features() {
  const [activeId, setActiveId] = useState(features[0].id)
  const activeFeature = features.find(f => f.id === activeId) || features[0]

  return (
    <section id='features' className="relative py-24 md:py-32 overflow-hidden bg-[#FDFDFD] dark:bg-[#0a0a0a]">

      {/* Background Texture (Matches Hero) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Subtle spotlight for this section */}
        <div className="absolute left-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]"></div>
      </div>

      <div className="container relative z-10 px-4 mx-auto max-w-6xl">

        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Store className="w-3 h-3" />
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Everything you need to <br className="hidden md:block" /> scale your empire.
          </h2>
          <p className="text-lg text-muted-foreground text-balance max-w-xl mx-auto">
            Powerful tools designed for modern creators. Build, sell, and grow without touching a single line of code.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Side: Interactive List */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            {features.map((feature) => {
              const isActive = activeId === feature.id
              return (
                <div
                  key={feature.id}
                  onClick={() => setActiveId(feature.id)}
                  className={cn(
                    "group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300",
                    isActive ? "bg-muted/60" : "hover:bg-muted/30"
                  )}
                >
                  {/* Active State Indicator (Motion) */}
                  {isActive && (
                    <motion.div
                      layoutId="active-bg"
                      className="absolute inset-0 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  <div className="relative z-10 mt-1">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300",
                      isActive ? feature.color : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )}>
                      <feature.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground")} />
                    </div>
                  </div>

                  <div className="relative z-10 flex-1">
                    <h3 className={cn(
                      "font-semibold text-base transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Arrow indicator for active state */}
                  <div className={cn(
                    "relative z-10 self-center transition-all duration-300",
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  )}>
                    <ArrowRight className="w-4 h-4 text-foreground/50" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Side: Image Preview */}
          <div className="lg:col-span-7 relative">
            <div className="sticky top-24">
              <div className="relative rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden aspect-[4/3] lg:aspect-[16/11]">

                {/* Browser Chrome / Header */}
                <div className="absolute top-0 inset-x-0 h-10 bg-muted/40 border-b border-border/50 flex items-center px-4 gap-2 z-20 backdrop-blur-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                  </div>
                  <div className="ml-4 px-3 py-0.5 rounded-md bg-background/50 border border-border/50 text-[10px] text-muted-foreground font-mono">
                    dashboard/{activeFeature.id.replace('item-', 'view/')}
                  </div>
                </div>

                {/* Content Image */}
                <div className="absolute inset-0 pt-10 bg-muted/20">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="h-full w-full relative"
                    >
                      <Image
                        src={activeFeature.image}
                        alt={activeFeature.title}
                        fill
                        className="object-cover object-top"
                        priority
                      />
                      {/* Gradient overlay at bottom to blend image if it's short */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/10 to-transparent"></div>
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>

              {/* Decorative Elements behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-2xl -z-10 opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
