import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // support HTML form fallback (_method=patch)
  const ct = req.headers.get('content-type') || '';
  let payload: any = {};
  if (ct.includes('application/json')) {
    payload = await req.json();
  } else {
    const fd = await req.formData();
    payload = Object.fromEntries(fd.entries());
  }
  if (payload._method && String(payload._method).toLowerCase() !== 'patch') {
    return NextResponse.json({ ok:false, error:'Unsupported' }, { status: 400 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const updates: Record<string, any> = {};
  if (payload.status) updates.status = String(payload.status);

  const { error } = await supabase.from('listings').update(updates).eq('id', params.id);
  if (error) return NextResponse.json({ ok:false, error }, { status: 500 });
  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
