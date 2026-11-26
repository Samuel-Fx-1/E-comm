import { useEffect, useMemo, useState } from 'react';
import { Check, MapPin, Search } from 'lucide-react';
import { countries, getCountry } from '../../config/site';
import { useSite } from '../../context/SiteContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function CountryModal() {
  const { countryModalOpen, setCountryModalOpen, country, city, setCountry, setCity } = useSite();
  const [draftCountry, setDraftCountry] = useState(country.code);
  const [draftCity, setDraftCity] = useState(city);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!countryModalOpen) return;
    setDraftCountry(country.code);
    setDraftCity(city);
    setFilter('');
  }, [countryModalOpen, country.code, city]);

  const selected = getCountry(draftCountry);
  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return countries;
    return countries.filter(
      (entry) => entry.name.toLowerCase().includes(needle) || entry.currency.toLowerCase().includes(needle)
    );
  }, [filter]);

  const save = () => {
    setCountry(draftCountry);
    setCity(draftCity);
    setCountryModalOpen(false);
  };

  return (
    <Modal
      open={countryModalOpen}
      onClose={() => setCountryModalOpen(false)}
      title="Choose your delivery location"
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setCountryModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            Done
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--brand-muted)]">
        Delivery options and speeds can change based on where you are. Your choice is saved on this device.
      </p>

      <label className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--brand-orange)]/40">
        <Search className="h-4 w-4 text-[var(--brand-muted)]" aria-hidden="true" />
        <span className="sr-only">Search countries</span>
        <input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Search country or currency"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--brand-muted)]"
        />
      </label>

      <div role="radiogroup" aria-label="Country" className="mt-4 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
        {filtered.map((entry) => {
          const checked = draftCountry === entry.code;
          return (
            <button
              key={entry.code}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => {
                setDraftCountry(entry.code);
                setDraftCity(entry.cities[0]);
              }}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] ${
                checked
                  ? 'border-[var(--brand-orange)] bg-[var(--brand-orange)]/5'
                  : 'border-[var(--brand-line)] bg-white hover:border-[var(--brand-navy)]'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{entry.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--brand-ink)]">{entry.name}</span>
                <span className="block text-xs text-[var(--brand-muted)]">{entry.currency}</span>
              </span>
              {checked && <Check className="h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden="true" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-[var(--brand-muted)]">
            No countries match “{filter}”.
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 rounded-xl bg-[var(--brand-cream)] p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">City / town</span>
          <select
            value={draftCity}
            onChange={(event) => setDraftCity(event.target.value)}
            className="rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2 text-sm font-medium text-[var(--brand-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            {selected.cities.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">Shipping to</span>
          <p className="flex items-center gap-2 rounded-lg border border-transparent py-2 text-sm font-semibold text-[var(--brand-ink)]">
            <MapPin className="h-4 w-4 text-[var(--brand-orange)]" aria-hidden="true" />
            {draftCity}, {selected.name}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--brand-muted)]">
        Prices display in {selected.currency}. Change currency any time from the header language & currency menu.
      </p>
    </Modal>
  );
}
