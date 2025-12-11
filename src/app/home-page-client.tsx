import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, ShoppingCart, Store, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextEffect } from '@/components/ui/text-effect';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { HeroHeader } from '@/components/header';
import FeaturesSection from '@/components/features/landing-page/features';
import HeroSection from '@/components/hero-section';

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: 'blur(12px)',
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: 'blur(0px)',
			y: 0,
			transition: {
				type: 'spring',
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
};

const features = [
	{
		icon: Store,
		title: 'Multi-Store Management',
		description: 'Create and manage multiple stores with unique branding from one dashboard.',
	},
	{
		icon: ShoppingCart,
		title: 'Product & Inventory',
		description: 'Add, organize, and track products with real-time inventory updates.',
	},
	{
		icon: BarChart3,
		title: 'Analytics Dashboard',
		description: 'Gain insights into store performance with built-in analytics and reports.',
	},
	{
		icon: Settings,
		title: 'Customizable Settings',
		description: 'Control branding, colors, and policies with flexible store settings.',
	},
];

export default function MainHeroSection() {
	return (
		<>
			<HeroHeader />
			<HeroSection />
			<FeaturesSection />
		</>
	);
}
