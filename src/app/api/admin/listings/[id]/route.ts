import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// PATCH /api/admin/listings/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const status = typeof body.status === 'string' ? body.status : undefined;
  if (!status) return NextResponse.json({ ok: false, error: 'status required' }, { status: 400 });

  const { error } = await db()
    .from('listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', params.id);

  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Support HTML form submit via POST, then redirect back to /admin
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ct = req.headers.get('content-type') || '';
  let status: string | undefined;

  if (ct.includes('application/json')) {
    const j = await req.json().catch(() => ({}));
    status = typeof j.status === 'string' ? j.status : undefined;
  } else {
    const fd = await req.formData();
    status = String(fd.get('status') || '');
  }

  if (!status) return NextResponse.json({ ok: false, error: 'status required' }, { status: 400 });

  // Reuse the PATCH logic
  const resp = await PATCH(
    new Request(req.url, { method: 'PATCH', body: JSON.stringify({ status }) }),
    { params },
  );

  // If it was a form submit, redirect to /admin after update
  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    return NextResponse.redirect(new URL('/admin', req.url), 303);
  }
  return resp;
}
