import { useMemo } from 'react';
import { StoreData } from '@/lib/domains/stores/types';

export type Role = 'owner' | 'admin' | 'member' | 'customer';

export type Permission =
  | 'manage_settings'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_customers'
  | 'view_analytics'
  | 'view_store';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'manage_settings',
    'manage_products',
    'manage_orders',
    'manage_customers',
    'view_analytics',
    'view_store',
  ],
  admin: [
    'manage_settings',
    'manage_products',
    'manage_orders',
    'manage_customers',
    'view_analytics',
    'view_store',
  ],
  member: [
    'manage_products',
    'manage_orders',
    'manage_customers',
    'view_analytics',
    'view_store',
  ],
  customer: ['view_store'],
};

export function checkPermission(
  user: { id: string } | null | undefined,
  store: StoreData | null | undefined,
  permission: Permission
): boolean {
  if (!user || !store) return false;

  // Owner check
  if (store.ownerUserId === user.id) return true;

  // Check role-based permissions
  if (store.currentUserRole) {
    const permissions = ROLE_PERMISSIONS[store.currentUserRole];
    return permissions?.includes(permission) || false;
  }

  return false;
}

export function usePermission(
  store: StoreData | null | undefined,
  user: { id: string } | null | undefined
) {
  return useMemo(() => {
    return {
      can: (permission: Permission) => checkPermission(user, store, permission),
      isOwner: store?.ownerUserId === user?.id,
    };
  }, [store, user]);
}
