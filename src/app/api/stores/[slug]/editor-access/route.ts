import { NextRequest } from 'next/server';

import { getApiContextOrNull } from '@/lib/api/context';
import { ok, serverError } from '@/lib/api/responses';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const ctx = await getApiContextOrNull(request, slug);
    if (ctx instanceof Response) return ctx;
    if (!ctx) return ok({ canEdit: false });

    const canEdit = !!ctx.session && ctx.store.ownerUserId === ctx.session.user.id;
    return ok({ canEdit });
  } catch (error) {
    return serverError('Failed to check editor access', { details: error });
  }
}

