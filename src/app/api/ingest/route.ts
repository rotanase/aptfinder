import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const payloadSchema = z.object({
  source: z.string(),
  external_id: z.string(),
  url: z.string().url(),
  transaction: z.enum(['rent','sale']).optional(),
  property_type: z.string().optional(),
  title: z.string().optional(),
  description_html: z.string().optional(),
  price: z.object({ value: z.number(), currency: z.string() }).optional(),
  rooms: z.number().optional(),
  surface_usable_sqm: z.number().optional(),
  floor: z.string().optional(),
  address: z.string().optional(),
  images: z.array(z.string()).optional(),
  posted_at: z.string().datetime().optional(),
  scraped_at: z.string().datetime().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

async function geocode(address?: string) {
  if (!address) return { point: null, norm: null };
  try {
    const url = new URL('https://api.opencagedata.com/geocode/v1/json');
    url.searchParams.set('q', address);
    url.searchParams.set('key', process.env.OPENCAGE_API_KEY!);
    url.searchParams.set('limit','1');
    const r = await fetch(url, { cache: 'no-store' });
    const j:any = await r.json();
    const c = j?.results?.[0];
    if (!c) return { point: null, norm: null };
    return {
      point: `SRID=4326;POINT(${c.geometry.lng} ${c.geometry.lat})`,
      norm: c.formatted as string,
    };
  } catch { return { point: null, norm: null }; }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok:false, error: parsed.error.flatten() }, { status: 400 });
  }
  const p = parsed.data;

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const desc = p.description_html
    ? p.description_html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
    : null;

  let location = p.lat!=null && p.lon!=null
    ? `SRID=4326;POINT(${p.lon} ${p.lat})`
    : null;
  let address_norm: string | null = null;

  if (!location && p.address) {
    const g = await geocode(p.address);
    location = g.point;
    address_norm = g.norm;
  }

  const { data, error } = await supabase.from('listings').upsert({
    source_id: p.source,
    external_id: p.external_id,
    url: p.url,
    transaction: p.transaction ?? null,
    property_type: p.property_type ?? null,
    title: p.title ?? null,
    description: desc,
    price: p.price?.value ?? null,
    currency: p.price?.currency ?? null,
    rooms: p.rooms ?? null,
    surface_sqm: p.surface_usable_sqm ?? null,
    floor: p.floor ?? null,
    address_raw: p.address ?? null,
    address_norm: address_norm ?? null,
    location,
    images: p.images ?? null,
    posted_at: p.posted_at ? new Date(p.posted_at).toISOString() : null,
    scraped_at: p.scraped_at ? new Date(p.scraped_at).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
  }, { onConflict: 'source_id,external_id' })
  .select('id');

  if (error) return NextResponse.json({ ok:false, error }, { status: 500 });
  return NextResponse.json({ ok:true, id: data?.[0]?.id });
}
