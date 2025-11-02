'use client';
import { useEffect, useState } from 'react';

type Item = {
  id: string; title: string | null; url: string;
  price: number | null; currency: string | null;
  rooms: number | null; surface_sqm: number | null;
  address_norm: string | null; source_id: string;
  images: string[] | null; posted_at: string | null;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    fetch('/api/listings').then(r => r.json()).then(j => setItems(j.items ?? []));
  }, []);
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Listings ({items.length})</h1>
      <ul className="grid md:grid-cols-2 gap-4">
        {items.map(it => (
          <li key={it.id} className="border rounded-lg p-4">
            <div className="flex gap-3">
              {it.images?.[0] && <img src={it.images[0]} alt="" className="w-28 h-20 object-cover rounded" />}
              <div className="flex-1">
                <a href={it.url} target="_blank" className="font-medium hover:underline">
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
    </main>
  );
}
