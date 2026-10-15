import { useEffect, useState } from 'react';
import { api } from '../api';
import { Err, Field, PageTitle } from '../components/ui';

const MAIN_CATEGORIES = [
  {
    name: 'Pharmaceuticals',
    children: ['Essential Medicines', 'Specialty Therapeutics', 'Over-the-Counter Products', 'Antibiotics', 'Pain Relief', 'Vitamins & Supplements', 'Diabetes Care', 'Allergy Care'],
  },
  {
    name: 'Medical Equipment & Devices',
    children: ['Diagnostic Equipment', 'Hospital Furniture', 'Surgical Instruments', 'Patient Monitors'],
  },
  {
    name: 'Medical Consumables',
    children: ['PPE', 'Syringes & Needles', 'Gloves', 'Bandages & Dressings', 'Laboratory Supplies'],
  },
  {
    name: 'Wholesale & Institutional Supply Services',
    children: ['Bulk Orders', 'Tender Participation', 'Scheduled Institutional Replenishment'],
  },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', parentId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api('/categories').then(setCategories).catch((e) => setError(e.message));

  async function create(name, parentId = null) {
    await api('/admin/categories', { method: 'POST', body: { name, parentId } });
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

  async function restoreStandardCategories() {
    setError('');
    setBusy(true);
    try {
      for (const main of MAIN_CATEGORIES) {
        await create(main.name);
        const current = await api('/categories');
        const parent = current.find((category) => category.name === main.name);
        for (const child of main.children) await create(child, parent?.id ?? null);
      }

      useEffect(() => {
        let active = true;
        api('/categories').then(async (current) => {
          if (!active) return;
          if (current.length) {
            setCategories(current);
            return;
          }
          await restoreStandardCategories();
        }).catch((e) => {
          if (active) setError(e.message);
        });
        return () => { active = false; };
      }, []);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageTitle right={<button className="btn" disabled={busy} onClick={restoreStandardCategories}>Restore standard categories</button>}>Categories</PageTitle>
      <p className="mb-5 max-w-2xl text-sm leading-6 text-slate-500">
        These are the same categories customers see in the store. Medicine types belong under Pharmaceuticals; the other business areas remain separate.
      </p>

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
            <h2 className="text-xl">{category.name}</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand">Main category</p>
            {category.children?.length > 0 ? (
              <ul className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                {category.children.map((child) => <li key={child.id} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700">↳ {child.name}</li>)}
              </ul>
            ) : <p className="mt-4 text-sm text-slate-500">No subcategories yet.</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
