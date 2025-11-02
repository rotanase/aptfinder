import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function getListings() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase
    .from('listings')
    .select('id,source_id,external_id,title,price,currency,rooms,surface_sqm,address_norm,status,posted_at,url')
    .order('updated_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export default async function AdminPage() {
  const items = await getListings();
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2">Price</th>
            <th className="p-2">Rooms</th>
            <th className="p-2">m²</th>
            <th className="p-2">Status</th>
            <th className="p-2">Source</th>
            <th className="p-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id} className="border-t">
              <td className="p-2 max-w-[360px]">
                <a className="font-medium hover:underline" href={it.url} target="_blank">{it.title ?? '(no title)'}</a>
                <div className="text-xs text-gray-500">{it.address_norm}</div>
              </td>
              <td className="p-2">{it.price ?? '—'} {it.currency ?? ''}</td>
              <td className="p-2 text-center">{it.rooms ?? '—'}</td>
              <td className="p-2 text-center">{it.surface_sqm ?? '—'}</td>
              <td className="p-2">{it.status}</td>
              <td className="p-2">{it.source_id}</td>
              <td className="p-2">
                <form action={`/api/admin/listings/${it.id}`} method="post">
                  <input type="hidden" name="_method" value="patch" />
                  <select name="status" defaultValue={it.status} className="border rounded p-1 text-xs">
                    <option value="active">active</option>
                    <option value="stale">stale</option>
                  </select>
                  <button className="ml-2 border rounded px-2 py-1 text-xs" type="submit">Save</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-2">
        Add header <code>X-Admin-Token: &lt;your token&gt;</code> when accessing /admin and /api/admin routes.
      </p>
    </main>
  );
}
