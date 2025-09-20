'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
	AppleIcon,
	AtSignIcon,
	ChevronLeftIcon,
	GithubIcon,
	Grid2x2PlusIcon,
	Loader2Icon,
} from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import AuroraHero from './shader-warp';


export function AuthPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isEmailLoading, setIsEmailLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const handleEmailSignIn = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!email || !password) {
				toast.error('Email and password are required');
				return;
			}
			setIsEmailLoading(true);
			try {

				toast.success('Signed in successfully');
				router.push('/dashboard/stores/new');
			} catch (error) {
				console.error('Failed to sign in with email', error);
				toast.error(
					error instanceof Error
						? error.message
						: 'Something went wrong while signing in',
				);
			} finally {
				setIsEmailLoading(false);
			}
		},
		[email, password, router],
	);

	const handleGoogleSignIn = useCallback(async () => {
		setIsGoogleLoading(true);
		try {
			const callbackURL =
				typeof window !== 'undefined'
					? new URL('/dashboard/stores/new', window.location.origin).toString()
					: '/dashboard/stores/new';

		} catch (error) {
			console.error('Failed to initiate Google sign in', error);
			toast.error(
				error instanceof Error
					? error.message
					: 'Unable to start Google sign in right now',
			);
		} finally {
			setIsGoogleLoading(false);
		}
	}, []);

	return (
		<main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
			<div className=" relative hidden h-full flex-col border-r p-10 lg:flex">
				<div className="z-10 flex items-center gap-2 mix-blend-difference">
					<Grid2x2PlusIcon className="w-6 h-6 text-white" />
					<h2 className="text-xl font-semibold text-white">Sell Your Stuff</h2>
				</div>

				<div className="z-10 mt-auto">
					<div className="z-10 flex items-center gap-2 mix-blend-difference">
						<p className="text-xl text-white">
							&ldquo;This Platform has helped me to save time and serve my clients
							faster than ever before.&rdquo;
						</p>
						<footer className="font-mono text-sm font-semibold">~ Ali Hassan</footer>
					</div>
				</div>
				<div className="absolute inset-0">
					<AuroraHero />
				</div>
			</div>
			<div className="relative flex min-h-screen flex-col justify-center p-4">
				<div
					aria-hidden
					className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
				>
					<div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
				</div>
				<Button variant="ghost" className="absolute top-7 left-5" asChild>
					<Link href="/">
						<ChevronLeftIcon className="size-4 me-2" />
						Home
					</Link>
				</Button>
				<div className="mx-auto space-y-4 sm:w-sm">
					<div className="flex items-center gap-2 lg:hidden">
						<Grid2x2PlusIcon className="size-6" />
						<p className="text-xl font-semibold">Asme</p>
					</div>
					<div className="flex flex-col space-y-1">
						<h1 className="font-heading text-2xl font-bold tracking-wide">
							Create Your Store
						</h1>
						<p className="text-muted-foreground text-base">
							Sign in to start building your online store.
						</p>
					</div>
					<div className="space-y-2">
						<Button
							type="button"
							size="lg"
							className="w-full"
							onClick={handleGoogleSignIn}
							disabled={isGoogleLoading}
							aria-disabled={isGoogleLoading}
						>
							{isGoogleLoading ? (
								<Loader2Icon className="size-4 me-2 animate-spin" />
							) : (
								<GoogleIcon className="size-4 me-2" />
							)}
							Continue with Google
						</Button>
						<Button type="button" size="lg" className="w-full" disabled aria-disabled>
							<AppleIcon className="size-4 me-2" />
							Continue with Apple
						</Button>
						<Button type="button" size="lg" className="w-full" disabled aria-disabled>
							<GithubIcon className="size-4 me-2" />
							Continue with GitHub
						</Button>
					</div>

					<AuthSeparator />

					<form className="space-y-2" onSubmit={handleEmailSignIn}>
						<p className="text-muted-foreground text-start text-xs">
							Enter your email address and password to log in or create an
							account and start your store
						</p>
						<div className="relative h-max">
							<Input
								placeholder="your.email@example.com"
								className="peer ps-9"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
							<div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
								<AtSignIcon className="size-4" aria-hidden="true" />
							</div>
						</div>
						<div className="relative h-max">
							<Input
								placeholder="••••••••"
								className="ps-3"
								type="password"
								autoComplete="current-password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</div>

						<Button type="submit" className="w-full" disabled={isEmailLoading} aria-disabled={isEmailLoading}>
							{isEmailLoading ? (
								<>
									<Loader2Icon className="me-2 size-4 animate-spin" />
									<span>Signing you in…</span>
								</>
							) : (
								<span>Continue & Create Store</span>
							)}
						</Button>
					</form>
					<p className="text-muted-foreground mt-8 text-sm">
						By continuing, you agree to our{' '}
						<a href="#" className="hover:text-primary underline underline-offset-4">
							Terms of Service
						</a>{' '}
						and{' '}
						<a href="#" className="hover:text-primary underline underline-offset-4">
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</main>
	);
}

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
		<g>
			<path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
		</g>
	</svg>
);

const AuthSeparator = () => {
	return (
		<div className="flex w-full items-center justify-center">
			<div className="bg-border h-px w-full" />
			<span className="text-muted-foreground px-2 text-xs">OR</span>
			<div className="bg-border h-px w-full" />
		</div>
	);
};
