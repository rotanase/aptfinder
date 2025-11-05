import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { searchParams } = new URL(req.url);
  const tx = searchParams.get('tx'); // 'rent' | 'sale'
  const pmin = Number(searchParams.get('pmin') || 0);
  const pmax = Number(searchParams.get('pmax') || 1e12);
  const rmin = Number(searchParams.get('rmin') || 0);
  const smin = Number(searchParams.get('smin') || 0);

  let q = supabase.from('listings')
    .select('id,title,url,price,currency,rooms,surface_sqm,address_norm,source_id,images,posted_at,location:location::text')
    .gte('price', pmin).lte('price', pmax)
    .gte('rooms', rmin)
    .gte('surface_sqm', smin)
    .order('posted_at', { ascending: false })
    .limit(200);

  if (tx) q = q.eq('transaction', tx);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok:false, error }, { status: 500 });
  return NextResponse.json({ ok:true, items: data });
}
