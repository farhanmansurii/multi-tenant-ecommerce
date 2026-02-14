'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { updateStorefrontContent } from '@/lib/domains/stores/storefront-content-client';
import { withBaseUrl } from '@/lib/utils/url';

type StorefrontEditContextValue = {
  enabled: boolean; // edit mode (via ?edit=1)
  canEdit: boolean; // currently same as enabled; later can gate by auth checks
  overrides: Record<string, any>;
  getOverride: (path: string) => any;
  setOverride: (path: string, value: any) => void;
  deleteOverride: (path: string) => void;
  save: (nextOverrides?: Record<string, any>) => Promise<void>;
  resetAll: () => void;
};

const Ctx = createContext<StorefrontEditContextValue | null>(null);

function getIn(obj: any, path: string) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

function setIn(prev: any, path: string, value: any) {
  const parts = path.split('.');
  const isIndex = (s: string) => /^\d+$/.test(s);
  const next = { ...(prev || {}) };
  let cur: any = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]!;
    const existing = cur[k];
    const nextKey = parts[i + 1]!;
    if (Array.isArray(existing)) {
      cur[k] = [...existing];
    } else if (existing && typeof existing === 'object') {
      cur[k] = { ...existing };
    } else {
      cur[k] = isIndex(nextKey) ? [] : {};
    }
    cur = cur[k];
  }
  const last = parts[parts.length - 1]!;
  if (Array.isArray(cur) && isIndex(last)) {
    cur[Number(last)] = value;
  } else {
    cur[last] = value;
  }
  return next;
}

function deleteIn(prev: any, path: string) {
  const parts = path.split('.');
  const isIndex = (s: string) => /^\d+$/.test(s);
  const next = { ...(prev || {}) };
  let cur: any = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]!;
    if (!cur[k] || typeof cur[k] !== 'object') return next;
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  }
  const last = parts[parts.length - 1]!;
  if (Array.isArray(cur) && isIndex(last)) {
    cur[Number(last)] = undefined;
  } else {
    delete cur[last];
  }
  return next;
}

export function StorefrontEditProvider({
  slug,
  initialOverrides,
  children,
}: {
  slug: string;
  initialOverrides: Record<string, any>;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const enabled = searchParams.get('edit') === '1';
  const router = useRouter();
  const pathname = usePathname();

  const [overrides, setOverrides] = useState<Record<string, any>>(initialOverrides || {});
  const [saving, setSaving] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [accessAllowed, setAccessAllowed] = useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setAccessChecked(false);
      setAccessAllowed(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(withBaseUrl(`/api/stores/${slug}/editor-access`), {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) {
          if (!cancelled) {
            setAccessChecked(true);
            setAccessAllowed(false);
          }
          return;
        }
        const data = await res.json().catch(() => null);
        const canEdit = !!data?.canEdit;
        if (!cancelled) {
          setAccessChecked(true);
          setAccessAllowed(canEdit);
          if (!canEdit) {
            toast.error('Owner access required to edit this storefront');
            const next = new URLSearchParams(searchParams.toString());
            next.delete('edit');
            const qs = next.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname);
          }
        }
      } catch {
        if (!cancelled) {
          setAccessChecked(true);
          setAccessAllowed(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, slug]);

  const getOverride = useCallback((path: string) => getIn(overrides, path), [overrides]);

  const setOverride = useCallback((path: string, value: any) => {
    setOverrides((prev) => setIn(prev, path, value));
  }, []);

  const deleteOverride = useCallback((path: string) => {
    setOverrides((prev) => deleteIn(prev, path));
  }, []);

  const save = useCallback(
    async (nextOverrides?: Record<string, any>) => {
      if (!enabled) return;
      if (!accessAllowed) return;
      if (saving) return;

      const payloadOverrides = nextOverrides ?? overrides;

      setSaving(true);
      try {
        await updateStorefrontContent(slug, {
          storefrontContentMode: 'custom',
          storefrontContent: payloadOverrides,
        });
        toast.success('Saved');
        setOverrides(payloadOverrides);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to save');
      } finally {
        setSaving(false);
      }
    },
    [enabled, accessAllowed, overrides, saving, slug]
  );

  const resetAll = useCallback(() => {
    setOverrides({});
  }, []);

  const value = useMemo<StorefrontEditContextValue>(
    () => ({
      enabled,
      canEdit: enabled && accessChecked && accessAllowed && !saving,
      overrides,
      getOverride,
      setOverride,
      deleteOverride,
      save,
      resetAll,
    }),
    [
      deleteOverride,
      enabled,
      accessAllowed,
      accessChecked,
      getOverride,
      overrides,
      save,
      saving,
      setOverride,
      resetAll,
    ]
  );

  return (
    <Ctx.Provider value={value}>
      {enabled && accessChecked && accessAllowed ? (
        <div
          style={{
            position: 'fixed',
            left: 16,
            bottom: 16,
            zIndex: 9999,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(10,10,10,0.65)',
            color: '#fff',
            backdropFilter: 'blur(8px)',
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 600 }}>Edit mode</div>
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            style={{
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '6px 10px',
              borderRadius: 8,
              background: saving ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
              color: '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams.toString());
              next.delete('edit');
              const qs = next.toString();
              router.push(qs ? `${pathname}?${qs}` : pathname);
            }}
            style={{
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '6px 10px',
              borderRadius: 8,
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Exit
          </button>
          <button
            type="button"
            onClick={() => {
              const ok = window.confirm('Reset all overrides? This will not be saved until you click Save.');
              if (!ok) return;
              resetAll();
              toast.success('Overrides cleared (not saved yet)');
            }}
            style={{
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '6px 10px',
              borderRadius: 8,
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      ) : null}
      {children}
    </Ctx.Provider>
  );
}

export function useStorefrontEdit() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      enabled: false,
      canEdit: false,
      overrides: {},
      getOverride: () => undefined,
      setOverride: () => {},
      deleteOverride: () => {},
      save: async () => {},
      resetAll: () => {},
    } satisfies StorefrontEditContextValue;
  }
  return ctx;
}
