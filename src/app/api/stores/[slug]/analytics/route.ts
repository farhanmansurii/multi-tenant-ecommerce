import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { getStoreBySlug, isUserMember } from "@/lib/domains/stores/helpers";
import { getStoreAnalytics } from "@/lib/domains/stores/analytics";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const store = await getStoreBySlug(slug);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Check permissions
    if (store.ownerUserId !== session.user.id) {
      const member = await isUserMember(store.id, session.user.id);
      if (!member || !member.permissions?.canViewAnalytics) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const analytics = await getStoreAnalytics(store.id);

    return NextResponse.json({
      analytics,
      currency: store.currency || "INR",
      storeName: store.name,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
