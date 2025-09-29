
'use client';
import Link from 'next/link';
import { Menu, MenuIcon, SearchIcon, ShoppingCart, User2Icon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { cn } from '@/lib/utils';
import { StoreData } from '@/lib/domains/stores/types';
import { useStorefrontStore } from '@/lib/state/storefront/storefront-store';
import { ModeToggle } from '@/components/shared/common/theme-toggle';
import StoreFrontContainer from './container';
import StoreLogo from './store-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type StoreFrontHeaderProps = {
	storeData: StoreData;
	cartItemCount?: number;
};

export const StoreFrontHeader = ({ storeData, cartItemCount }: StoreFrontHeaderProps) => {
	const [menuState, setMenuState] = React.useState(false);
	const [isScrolled, setIsScrolled] = React.useState(false);
	const menuItems = React.useMemo(() => {
		if (!storeData?.slug) {
			return [
				{ name: 'All Products', href: '/products' },
				{ name: 'Categories', href: '/categories' },
			];
		}

		return [
			{ name: 'All Products', href: `/stores/${storeData.slug}` },
			{ name: 'Categories', href: `/stores/${storeData.slug}#categories` },
		];
	}, [storeData?.slug]);
	const fallbackCartCount = useStorefrontStore((state) => state.cart.totalQuantity);
	const customerProfile = useStorefrontStore((state) => {
		if (!storeData?.slug) return null;
		return state.customerProfile?.storeSlug === storeData.slug ? state.customerProfile : null;
	});
	const cartHref = storeData?.slug ? `/stores/${storeData.slug}/cart` : '/cart';
	const accountHref = storeData?.slug
		? customerProfile
			? `/stores/${storeData.slug}/account`
			: `/stores/${storeData.slug}/login`
		: '/account';
	const accountTooltip = customerProfile ? 'Account' : 'Sign in';
	const displayCartCount = cartItemCount ?? fallbackCartCount;

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<header>
			<nav
				data-state={menuState && 'active'}
				className={cn(
					'fixed z-20 w-full transition-all border-b border-black/5 duration-300',
					isScrolled && 'bg-background/75 border-black/5 backdrop-blur-lg'
				)}
			>
				<StoreFrontContainer className="py-2">
					<div
						className={cn(
							'relative flex flex-wrap items-center justify-between gap-6 py-3 transition-all duration-200 lg:gap-0',
							isScrolled && 'py-3'
						)}
					>
						<div className="flex w-full justify-between gap-6 lg:w-auto">
							<StoreLogo
								src={storeData?.logo || '/store-logo.png'}
								alt={storeData?.name || 'Store Logo'}
								className="h-8 w-auto rounded-md"
								isLink
								href="/"
							/>
							<button
								onClick={() => setMenuState(!menuState)}
								aria-label={menuState ? 'Close Menu' : 'Open Menu'}
								className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
							>
								<Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
								<X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
							</button>

							<div className="m-auto hidden size-fit lg:block">
								<ul className="flex gap-1">
									{menuItems.map((item, index) => (
										<li key={index}>
											<Button asChild variant="ghost" size="sm">
												<Link href={item.href} className="text-base">
													<span>{item.name}</span>
												</Link>
											</Button>
										</li>
									))}
								</ul>
							</div>
						</div>

						<div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
							<div className="lg:hidden">
								<ul className="space-y-6 text-base">
									{menuItems.map((item, index) => (
										<li key={index}>
											<Link
												href={item.href}
												className="text-muted-foreground hover:text-accent-foreground block duration-150"
											>
												<span>{item.name}</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
								<TooltipProvider>
									<ModeToggle />

									<Tooltip>
										<TooltipTrigger asChild>
											<Link href="/search">
												<Button variant="ghost" size="icon">
													<SearchIcon />
												</Button>
											</Link>
										</TooltipTrigger>
										<TooltipContent>Search</TooltipContent>
									</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link href={accountHref}>
								<Button variant="ghost" size="icon">
									<User2Icon />
								</Button>
							</Link>
						</TooltipTrigger>
						<TooltipContent>{accountTooltip}</TooltipContent>
					</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link href={cartHref}>
												<Button
													variant="ghost"
													size="icon"
													className="relative"
												>
													<ShoppingCart />
													{displayCartCount > 0 && (
														<span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold leading-none text-primary-foreground">
															{displayCartCount}
														</span>
													)}
												</Button>
											</Link>
										</TooltipTrigger>
										<TooltipContent>Cart</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link href="/menu">
												<Button variant="ghost" size="icon">
													<MenuIcon />
												</Button>
											</Link>
										</TooltipTrigger>
										<TooltipContent>More</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					</div>
				</StoreFrontContainer>
			</nav>
		</header>
	);
};
