import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { dict } from './i18n';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [cart, setCart] = useState(() => read('cart', []));

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { document.documentElement.lang = lang; localStorage.setItem('lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api('/auth/me')
      .then(({ user }) => { setUser(user); setLang(user.language); setTheme(user.theme); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true));
  }, []);

  const save = (patch) => { if (user) api('/auth/me', { method: 'PATCH', body: patch }).catch(() => {}); };
  const changeLang = (l) => { setLang(l); save({ language: l }); };
  const changeTheme = (t) => { setTheme(t); save({ theme: t }); };

  const login = ({ token, user }) => { localStorage.setItem('token', token); setUser(user); setLang(user.language); setTheme(user.theme); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  const t = (k) => dict[lang]?.[k] ?? dict.en[k] ?? k;

  const addToCart = (p, qty = 1) => setCart((c) => {
    const ex = c.find((i) => i.id === p.id);
    if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + qty, p.stock) } : i));
    return [...c, { id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, requiresRx: p.requiresRx, stock: p.stock, qty }];
  });
  const setQty = (id, qty) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i)));
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  return (
    <Ctx.Provider value={{ user, ready, lang, theme, changeLang, changeTheme, login, logout, t, cart, addToCart, setQty, removeFromCart, clearCart }}>
      {children}
    </Ctx.Provider>
  );
}
