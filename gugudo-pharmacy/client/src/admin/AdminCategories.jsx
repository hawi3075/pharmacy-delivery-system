import { useEffect, useState } from 'react';
import { api } from '../api';
import { Err, Field, PageTitle } from '../components/ui';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', parentId: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api('/categories').then(setCategories).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function create(name, parentId = null) {
    await api('/admin/categories', { method: 'POST', body: { name, parentId } });
  }

  async function restoreStandardCategories() {
    setError('');
    setBusy(true);
    try {
      await api('/admin/categories/restore-standard', { method: 'POST' });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function add(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await create(form.name.trim(), form.parentId ? Number(form.parentId) : null);
      setForm({ name: '', parentId: '' });
      await load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  }

  async function edit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api(`/admin/categories/${editing.id}`, {
        method: 'PUT',
        body: { name: editing.name.trim(), parentId: editing.parentId ? Number(editing.parentId) : null },
      });
      setEditing(null);
      await load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageTitle right={<button className="btn" disabled={busy} onClick={restoreStandardCategories}>Restore standard categories</button>}>Categories</PageTitle>
      <p className="mb-5 max-w-2xl text-sm leading-6 text-slate-500">These are the same categories customers see in the store.</p>
      <form onSubmit={add} className="card mb-5 grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <Field label="Category name"><input required minLength={2} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Diagnostic Equipment" /></Field>
        <Field label="Parent category (optional)">
          <select className="input" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
            <option value="">Main category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Add category'}</button>
      </form>
      <Err msg={error} />
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <section className="card p-5" key={category.id}>
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-xl">{category.name}</h2><p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand">Main category</p></div>
              <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => setEditing({ id: category.id, name: category.name, parentId: category.parentId || '' })}>Edit</button>
            </div>
            {category.children?.length > 0 ? (
              <ul className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                {category.children.map((child) => <li key={child.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700"><span>↳ {child.name}</span><button className="btn-ghost !px-2.5 !py-1 text-xs" onClick={() => setEditing({ id: child.id, name: child.name, parentId: category.id })}>Edit</button></li>)}
              </ul>
            ) : <p className="mt-4 text-sm text-slate-500">No subcategories yet.</p>}
          </section>
        ))}
      </div>
      {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><form onSubmit={edit} className="card w-full max-w-md space-y-4 p-6"><h2 className="text-xl">Edit category</h2><Field label="Category name"><input required minLength={2} className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field><Field label="Parent category"><select className="input" value={editing.parentId} onChange={(e) => setEditing({ ...editing, parentId: e.target.value })}><option value="">Main category</option>{categories.filter((c) => c.id !== editing.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn" disabled={busy}>Save</button></div></form></div>}
    </div>
  );
}
