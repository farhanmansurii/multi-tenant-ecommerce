'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useStorefrontEdit } from './StorefrontEditProvider';

const EditableTextPopover = dynamic(() => import('./EditableTextPopover'), {
  ssr: false,
  loading: () => null,
});

function coerceString(v: any): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

export function EditableText({
  path,
  label,
  fallback,
  as: Tag = 'span',
  multiline = false,
  className,
  style,
}: {
  path: string;
  label?: string;
  fallback: string;
  as?: any;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const edit = useStorefrontEdit();

  const override = edit.getOverride(path);
  const value = coerceString(override ?? fallback);

  if (!edit.enabled) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  if (!edit.canEdit) {
    // Edit mode requested, but user is not allowed (or not yet checked). Render plain value.
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <EditableTextPopover
      path={path}
      label={label}
      fallback={fallback}
      value={value}
      as={Tag}
      multiline={multiline}
      className={className}
      style={style}
    />
  );
}
