'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type Props = { items: Array<{ id:string; title:string|null; url:string; location:string|null }> };

function wktPointToLngLat(wkt: string | null) {
  if (!wkt) return null; // "SRID=4326;POINT(lon lat)"
  const m = wkt.match(/POINT\(([-\d\.]+) ([-\d\.]+)\)/);
  if (!m) return null;
  return [parseFloat(m[1]), parseFloat(m[2])] as [number, number];
}

export default function Map({ items }: Props) {
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
      center: [26.1025, 44.4268],
      zoom: 11,
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
      (map as any).__markers.push(marker);
    });

    if (coords.length) {
      const bounds = new mapboxgl.LngLatBounds(coords[0], coords[0]);
      coords.forEach(c => bounds.extend(c));
      map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 0 });
    }
  }, [items]);

  return <div ref={containerRef} className="w-full h-[60vh] rounded-lg border bg-gray-100" />;
}
