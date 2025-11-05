'use client';
import { useEffect, useMemo, useState } from 'react';
import Map from '@/components/Map';
import Link from 'next/link';

type Item = {
  id:string; title:string|null; url:string; price:number|null; currency:string|null;
  rooms:number|null; surface_sqm:number|null; address_norm:string|null;
  source_id:string; images:string[]|null; posted_at:string|null; location:string|null;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
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
    <main className="flex flex-col h-screen">
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-24"></div>
            <div className="flex-grow text-center">
              <h1 className="text-4xl font-bold text-gray-800">aptfinder</h1>
            </div>
            <div className="flex items-center">
              <Link href="/admin" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Admin</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 gap-3">
            <select className="w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2" value={q.tx} onChange={e => setQ({ ...q, tx: e.target.value })}>
              <option value="">Rent or Sale</option>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
            </select>
            <input className="w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2" placeholder="Min price" value={q.pmin} onChange={e => setQ({ ...q, pmin: e.target.value })}/>
            <input className="w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2" placeholder="Max price" value={q.pmax} onChange={e => setQ({ ...q, pmax: e.target.value })}/>
            <input className="w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2" placeholder="Min rooms" value={q.rmin} onChange={e => setQ({ ...q, rmin: e.target.value })}/>
            <input className="w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2" placeholder="Min m²" value={q.smin} onChange={e => setQ({ ...q, smin: e.target.value })}/>
          </div>
        </div>
      </div>
      <div className="flex flex-grow">
        <div className="w-2/3 h-full">
          <Map items={items.map(it => ({ id: it.id, title: it.title, url: it.url, location: it.location }))} onMarkerClick={setSelectedItemId} />
        </div>
        <div className="w-1/3 p-4 space-y-4 overflow-y-auto bg-gray-50">
          <ul className="grid grid-cols-2 gap-4">
            {items.map(it => (
              <li key={it.id} className={`border rounded-lg p-3 shadow-sm ${selectedItemId === it.id ? 'bg-blue-100' : 'bg-white'}`}>
                <div className="flex flex-col gap-2">
                  {it.images?.[0] && <img src={it.images[0]} alt="" className="w-full h-24 object-cover rounded-md" />}
                  <div className="flex-1">
                    <a href={it.url} target="_blank" className="font-semibold text-gray-800 hover:underline">
                      {it.title || '(no title)'}
                    </a>
                    <div className="text-sm text-gray-600">
                      {it.price ? `${it.price} ${it.currency || ''}` : '—'} · {it.rooms ?? '—'} rooms · {it.surface_sqm ?? '—'} m²
                    </div>
                    <div className="text-xs text-gray-500">
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
