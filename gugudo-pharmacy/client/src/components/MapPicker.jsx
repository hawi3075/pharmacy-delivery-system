import { useEffect, useRef, useState } from 'react';

const KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
let loader;
function loadGoogle() {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (!loader) loader = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}`;
    s.async = true; s.onload = () => resolve(window.google); s.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(s);
  });
  return loader;
}

 
const DEFAULT = { lat: 8.54, lng: 39.27 };

export default function MapPicker({ value, onChange, height = 260 }) {
  const el = useRef(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!KEY) return setErr('Add VITE_GOOGLE_MAPS_KEY to client/.env to enable the map.');
    let marker;
    loadGoogle().then((g) => {
      const start = value?.lat ? { lat: value.lat, lng: value.lng } : DEFAULT;
      const map = new g.maps.Map(el.current, { center: start, zoom: 14, streetViewControl: false, mapTypeControl: false });
      const geocoder = new g.maps.Geocoder();
      marker = new g.maps.Marker({ map, position: start, draggable: true });
      const pick = (pos) => {
        marker.setPosition(pos);
        geocoder.geocode({ location: pos }, (r, status) =>
          onChange({ lat: pos.lat, lng: pos.lng, address: status === 'OK' && r[0] ? r[0].formatted_address : '' }));
      };
      map.addListener('click', (e) => pick({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
      marker.addListener('dragend', (e) => pick({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
      if (!value?.lat && navigator.geolocation)
        navigator.geolocation.getCurrentPosition((p) => { const pos = { lat: p.coords.latitude, lng: p.coords.longitude }; map.setCenter(pos); pick(pos); }, () => {});
    }).catch((e) => setErr(e.message));
    // eslint-disable-next-line
  }, []);

  if (err) return <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">{err}</div>;
  return <div ref={el} style={{ height }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700" />;
}
