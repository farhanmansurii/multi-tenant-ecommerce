/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test basic connection
    const result = await db.execute('SELECT version()');

    // Test if stores table exists and get its structure
    const tables = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const storesColumns = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'stores'
      ORDER BY ordinal_position
    `);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        postgresVersion: result[0]?.version,
        tables: tables.map((t: any) => t.table_name),
        storesTable: {
          exists: storesColumns.length > 0,
          columns: storesColumns.map((col: any) => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES'
          }))
        }
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
