'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useStorefrontEdit } from './StorefrontEditProvider';

function coerceString(v: any): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

function trunc(s: string, max = 120) {
  const str = coerceString(s);
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

function toLabelFromPath(path: string) {
  const parts = path.split('.').filter(Boolean);
  const pretty = parts
    .map((p) => p.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .map((p) => (p.match(/^\d+$/) ? `#${p}` : p))
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  if (pretty.length === 0) return 'Edit';
  if (pretty.length === 1) return pretty[0]!;
  return `${pretty[0]}: ${pretty.slice(1).join(' ')}`;
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
  if (Array.isArray(cur) && isIndex(last)) cur[Number(last)] = value;
  else cur[last] = value;
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
  if (Array.isArray(cur) && isIndex(last)) cur[Number(last)] = undefined;
  else delete cur[last];
  return next;
}

export default function EditableTextPopover({
  path,
  label,
  fallback,
  value,
  as: Tag,
  multiline,
  className,
  style,
}: {
  path: string;
  label?: string;
  fallback: string;
  value: string;
  as: any;
  multiline: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const edit = useStorefrontEdit();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setDraft(coerceString(edit.getOverride(path) ?? ''));
    setShowAdvanced(false);
    // Focus after Radix positions the popover.
    queueMicrotask(() => inputRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Tag
          className={className}
          style={{
            ...style,
            outline: '1px dashed rgba(255,255,255,0.35)',
            outlineOffset: 4,
            cursor: 'text',
          }}
          onClick={(e: any) => {
            e?.stopPropagation?.();
            setOpen(true);
          }}
        >
          {value}
        </Tag>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-0"
        side="top"
        align="center"
        sideOffset={10}
        collisionPadding={12}
        sticky="always"
        updatePositionStrategy="always"
        hideWhenDetached={true}
      >
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium leading-none">{label || toLabelFromPath(path)}</div>
              <button
                type="button"
                className="mt-1 font-mono text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                {showAdvanced ? 'Hide advanced' : 'Advanced'}
              </button>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          {showAdvanced ? (
            <div className="mt-2 rounded-md border bg-muted/30 p-2">
              <div className="text-[11px] text-muted-foreground">Key</div>
              <div className="mt-0.5 font-mono text-[11px] break-all">{path}</div>
            </div>
          ) : null}
        </div>
        <Separator />
        <div className="px-4 py-3 space-y-3">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Leave empty to override with an empty string. Use Reset to inherit again.
            </div>
            {multiline ? (
              <Textarea
                ref={(el) => {
                  inputRef.current = el;
                }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                onKeyDown={async (e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    const next = setIn(edit.overrides, path, draft);
                    edit.setOverride(path, draft);
                    await edit.save(next);
                    setOpen(false);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setOpen(false);
                  }
                }}
              />
            ) : (
              <Input
                ref={(el) => {
                  inputRef.current = el;
                }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const next = setIn(edit.overrides, path, draft);
                    edit.setOverride(path, draft);
                    await edit.save(next);
                    setOpen(false);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setOpen(false);
                  }
                }}
              />
            )}
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-[11px] text-muted-foreground">Inherits</div>
            <div className="mt-1 text-xs leading-snug">{trunc(fallback, 220)}</div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-muted-foreground">
              {multiline ? 'Shortcut: Cmd/Ctrl + Enter to save' : 'Shortcut: Enter to save'}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={async () => {
                  const next = deleteIn(edit.overrides, path);
                  edit.deleteOverride(path);
                  await edit.save(next);
                  setOpen(false);
                }}
              >
                Reset
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  const next = setIn(edit.overrides, path, draft);
                  edit.setOverride(path, draft);
                  await edit.save(next);
                  setOpen(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
