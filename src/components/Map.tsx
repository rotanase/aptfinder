'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type Props = { items: Array<{ id:string; title:string|null; url:string; location:string|null }>, onMarkerClick?: (id: string) => void };

function wktPointToLngLat(wkt: string | null) {
  if (!wkt) return null;
  // It's not WKT, it's EWKB hex
  const m = wkt.match(/^0101000020E6100000([0-9A-F]{16})([0-9A-F]{16})$/i);
  if (!m) return null;
  const lon = Buffer.from(m[1], 'hex').readDoubleLE(0);
  const lat = Buffer.from(m[2], 'hex').readDoubleLE(0);
  return [lon, lat] as [number, number];
}

export default function Map({ items, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!mapboxgl.accessToken) {
      console.error('Missing NEXT_PUBLIC_MAPBOX_TOKEN');
      return;
    }
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [26.0861, 44.4522],
      zoom: 12,
    });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    (map as any).__markers?.forEach((m: mapboxgl.Marker) => m.remove());
    (map as any).__markers = [];

    const coords: [number, number][] = [];
    items.forEach((it) => {
      const ll = wktPointToLngLat(it.location);
      if (!ll) return;
      coords.push(ll);
      const marker = new mapboxgl.Marker().setLngLat(ll).addTo(map);
      marker.getElement().addEventListener('click', () => {
        onMarkerClick?.(it.id);
      });
      (map as any).__markers.push(marker);
    });

    if (coords.length > 1) {
      const bounds = new mapboxgl.LngLatBounds(coords[0], coords[0]);
      coords.forEach(c => bounds.extend(c));
      map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 0 });
    }
  }, [items]);

  return <div ref={containerRef} className="w-full h-full rounded-lg border bg-gray-100" />;
}
