"use client";

import GoogleSignInButton from '@/components/reusables/google-login';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/session-context';
import { redirect, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
	const { isAuthenticated, isPending } = useAuth();
	const searchParams = useSearchParams();
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);

	useEffect(() => {
		if (searchParams.get('login') === 'true') {
			setShowLoginPrompt(true);
		}
	}, [searchParams]);

  if(isAuthenticated) redirect('/dashboard')

	return (
		<div className="min-h-screen ">
			<nav className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<h1 className="text-xl font-semibold">Multi-Tenant Ecommerce</h1>
						</div>
						<div className="flex items-center space-x-4">
							{isPending ? (
								<div className="text-sm text-gray-500">Loading...</div>
							) : isAuthenticated ? (
								<Link href="/dashboard">
									<Button>Go to Dashboard</Button>
								</Link>
							) : (
								<GoogleSignInButton />
							)}
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					{showLoginPrompt && (
						<Alert className="mb-6">
							<AlertDescription>
								Please sign in to access the dashboard.
							</AlertDescription>
						</Alert>
					)}

					<div className="text-center">
						<h2 className="text-3xl font-bold text-gray-900">Welcome to Multi-Tenant Ecommerce</h2>
						<p className="mt-4 text-lg ">
							Create and manage your online stores with ease.
						</p>

						{isPending ? (
							<div className="mt-8">
								<div className="text-gray-500">Loading...</div>
							</div>
						) : isAuthenticated ? (
							<div className="mt-8">
								<Link href="/dashboard">
									<Button size="lg">
										Go to Dashboard
									</Button>
								</Link>
							</div>
						) : (
							<div className="mt-8">
								<GoogleSignInButton />
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
