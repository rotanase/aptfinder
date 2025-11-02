'use client';
import { useEffect, useMemo, useState } from 'react';
import Map from '@/components/Map';

type Item = {
  id:string; title:string|null; url:string; price:number|null; currency:string|null;
  rooms:number|null; surface_sqm:number|null; address_norm:string|null;
  source_id:string; images:string[]|null; posted_at:string|null; location:string|null;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState({ tx:'', pmin:'', pmax:'', rmin:'', smin:'' });

  const qs = useMemo(() => {
    const s = new URLSearchParams();
    if (q.tx) s.set('tx', q.tx);
    if (q.pmin) s.set('pmin', q.pmin);
    if (q.pmax) s.set('pmax', q.pmax);
    if (q.rmin) s.set('rmin', q.rmin);
    if (q.smin) s.set('smin', q.smin);
    return s.toString();
  }, [q]);

  useEffect(() => {
    const url = '/api/listings' + (qs ? `?${qs}` : '');
    fetch(url).then(r => r.json()).then(j => setItems(j.items ?? []));
  }, [qs]);

  return (
    <main className="p-6 space-y-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold">Listings ({items.length})</h1>

      <div className="grid md:grid-cols-5 gap-3">
        <div className="md:col-span-1 space-y-3">
          <select className="w-full border rounded p-2"
            value={q.tx} onChange={e => setQ({ ...q, tx: e.target.value })}>
            <option value="">Rent or Sale</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </select>
          <input className="w-full border rounded p-2" placeholder="Min price"
            value={q.pmin} onChange={e => setQ({ ...q, pmin: e.target.value })}/>
          <input className="w-full border rounded p-2" placeholder="Max price"
            value={q.pmax} onChange={e => setQ({ ...q, pmax: e.target.value })}/>
          <input className="w-full border rounded p-2" placeholder="Min rooms"
            value={q.rmin} onChange={e => setQ({ ...q, rmin: e.target.value })}/>
          <input className="w-full border rounded p-2" placeholder="Min m²"
            value={q.smin} onChange={e => setQ({ ...q, smin: e.target.value })}/>
        </div>

        <div className="md:col-span-4 space-y-3">
          <Map items={items.map(it => ({ id: it.id, title: it.title, url: it.url, location: it.location }))} />
          <ul className="grid md:grid-cols-2 gap-3">
            {items.map(it => (
              <li key={it.id} className="border rounded-lg p-3">
                <div className="flex gap-3">
                  {it.images?.[0] && <img src={it.images[0]} alt="" className="w-28 h-20 object-cover rounded" />}
                  <div className="flex-1">
                    <a href={it.url} target="_blank" className="font-medium hover:underline">
                      {it.title || '(no title)'}
                    </a>
                    <div className="text-sm opacity-70">
                      {it.price ? `${it.price} ${it.currency || ''}` : '—'} · {it.rooms ?? '—'} rooms · {it.surface_sqm ?? '—'} m²
                    </div>
                    <div className="text-xs opacity-60">
                      {it.address_norm || ''} · {it.source_id.toUpperCase()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
