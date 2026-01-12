import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { getStoreBySlug, isUserMember } from "@/lib/domains/stores/helpers";
import { getStoreAnalytics } from "@/lib/domains/stores/analytics";
import { ok, unauthorized, notFound, forbidden, serverError, logRouteError } from "@/lib/api/responses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return unauthorized();
    }

    const { slug } = await params;
    const store = await getStoreBySlug(slug);

    if (!store) {
      return notFound("Store not found");
    }

    // Check permissions
    if (store.ownerUserId !== session.user.id) {
      const member = await isUserMember(store.id, session.user.id);
      if (!member || !member.permissions?.canViewAnalytics) {
        return forbidden();
      }
    }

    const analytics = await getStoreAnalytics(store.id);

    return ok({
      analytics,
      currency: store.currency || "INR",
      storeName: store.name,
    });
  } catch (error) {
    await logRouteError("Error fetching analytics", error, params);
    return serverError();
  }
}
