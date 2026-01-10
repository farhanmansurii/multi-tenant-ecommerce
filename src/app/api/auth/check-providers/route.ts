import { NextResponse } from "next/server";

export async function GET() {
	const googleEnabled = !!(
		process.env.BETTER_AUTH_GOOGLE_CLIENT_ID &&
		process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET
	);

	return NextResponse.json({
		google: googleEnabled,
	});
}
