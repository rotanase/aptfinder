export function wktPointToLngLat(wkt: string | null) {
  if (!wkt) return null; // "SRID=4326;POINT(lon lat)"
  const m = wkt.match(/POINT\(([-\d\.]+) ([-\d\.]+)\)/);
  if (!m) return null;
  return [parseFloat(m[1]), parseFloat(m[2])] as [number, number];
}
