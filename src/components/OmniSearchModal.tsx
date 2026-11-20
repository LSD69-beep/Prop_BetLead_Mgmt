import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FLATS_DATABASE, DEVELOPERS_DATABASE, BUILDING_LOCATIONS } from '../data/mockData';
import { Flat, DeveloperStock, BuildingLocation, BuyerLead } from '../types';
import {
  Search,
  X,
  Building2,
  TrendingUp,
  MapPin,
  Users,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  Command,
  ChevronRight,
  FileText,
  DollarSign,
  Phone,
} from 'lucide-react';

interface OmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchCategory = 'all' | 'flats' | 'stocks' | 'locations' | 'leads';

export type SearchResultItem =
  | { type: 'flat'; data: Flat; id: string }
  | { type: 'stock'; data: DeveloperStock; id: string }
  | { type: 'location'; data: BuildingLocation; id: string }
  | { type: 'lead'; data: BuyerLead; id: string };

export const OmniSearchModal: React.FC<OmniSearchModalProps> = ({ isOpen, onClose }) => {
  const { navigate, buyerLeads, setSelectedDeveloperId, setSelectedCompany } = useApp();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Normalized matching results
  const results: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchedFlats: SearchResultItem[] = FLATS_DATABASE.filter(
      (f: Flat) =>
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.locality.toLowerCase().includes(q) ||
        f.company.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.bedrooms.toLowerCase().includes(q) ||
        f.price.toLowerCase().includes(q) ||
        f.reraNumber.toLowerCase().includes(q)
    ).map((item: Flat) => ({ type: 'flat' as const, data: item, id: `flat-${item.id}` }));

    const matchedStocks: SearchResultItem[] = DEVELOPERS_DATABASE.filter(
      (s: DeveloperStock) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.ticker.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.hq.toLowerCase().includes(q)
    ).map((item: DeveloperStock) => ({ type: 'stock' as const, data: item, id: `stock-${item.id}` }));

    const matchedLocations: SearchResultItem[] = BUILDING_LOCATIONS.filter(
      (l: BuildingLocation) =>
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.companyName.toLowerCase().includes(q) ||
        l.place.toLowerCase().includes(q) ||
        l.stage.toLowerCase().includes(q)
    ).map((item: BuildingLocation) => ({ type: 'location' as const, data: item, id: `loc-${item.id}` }));

    const matchedLeads: SearchResultItem[] = buyerLeads.filter(
      (lead: BuyerLead) =>
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.project.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.status.toLowerCase().includes(q) ||
        lead.budget.toLowerCase().includes(q)
    ).map((item: BuyerLead) => ({ type: 'lead' as const, data: item, id: `lead-${item.id}` }));

    if (activeCategory === 'flats') return matchedFlats;
    if (activeCategory === 'stocks') return matchedStocks;
    if (activeCategory === 'locations') return matchedLocations;
    if (activeCategory === 'leads') return matchedLeads;

    // 'all': blend results
    return [...matchedFlats, ...matchedStocks, ...matchedLocations, ...matchedLeads];
  }, [query, activeCategory, buyerLeads]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= results.length) {
      setSelectedIndex(Math.max(0, results.length - 1));
    }
  }, [results.length, selectedIndex]);

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    }
  };

  const handleSelectResult = (result: (typeof results)[0]) => {
    onClose();
    if (result.type === 'flat') {
      const flat = result.data as Flat;
      navigate('customer-flat-detail', { flatId: flat.id });
    } else if (result.type === 'stock') {
      const stock = result.data as DeveloperStock;
      setSelectedDeveloperId(stock.id);
      navigate('customer-developer-stocks', { devId: stock.id });
    } else if (result.type === 'location') {
      const loc = result.data as BuildingLocation;
      setSelectedCompany(loc.companyName);
      navigate('agent-location-leads', {
        company: loc.companyName,
        project: loc.name,
        place: loc.place,
      });
    } else if (result.type === 'lead') {
      const lead = result.data as BuyerLead;
      navigate('agent-lead-profile', { leadId: lead.id });
    }
  };

  if (!isOpen) return null;

  const currentSelection = results[selectedIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Universal Search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#D0DDD7] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D0DDD7] bg-white">
          <Search className="w-5 h-5 text-[#0F4C5C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search flats, developers, locations, or buyer leads... (e.g. Sobha, DLF, 4 BHK, Villa)"
            className="flex-1 bg-transparent text-base sm:text-lg text-[#152226] placeholder-[#8FA3A8] outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 rounded-md text-[#8FA3A8] hover:text-[#152226] hover:bg-[#F2F5F3] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-['Red_Hat_Mono'] font-semibold bg-[#F2F5F3] text-[#4B5E63] border border-[#D0DDD7] rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills & Quick Chips */}
        <div className="px-5 py-2.5 bg-[#F9FBFA] border-b border-[#D0DDD7] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'All Results' },
              { id: 'flats', label: 'Flats & Villas' },
              { id: 'stocks', label: 'Developer Stocks' },
              { id: 'locations', label: 'Locations & GIS' },
              { id: 'leads', label: 'Buyer Leads' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as SearchCategory);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-[#0F4C5C] text-white shadow-xs'
                    : 'bg-white text-[#4B5E63] hover:text-[#152226] border border-[#D0DDD7]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[#4B5E63]">
            <span className="text-[11px]">Quick filters:</span>
            {['Sobha Villa', 'DLF Camellias', 'Prestige', 'High Efficiency'].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setQuery(chip);
                  setSelectedIndex(0);
                }}
                className="text-[11px] underline hover:text-[#0F4C5C] cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body: Left List + Right Inspection Preview Card */}
        <div className="flex-1 min-h-[360px] grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-white">
          {/* Results List */}
          <div className="md:col-span-7 border-r border-[#D0DDD7] overflow-y-auto max-h-[500px] p-2 space-y-1">
            {results.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-[#4B5E63]">
                <Search className="w-8 h-8 text-[#8FA3A8]" />
                <p className="font-semibold text-sm text-[#152226]">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs">Try searching by developer (DLF, Sobha, Prestige), city, or project name.</p>
              </div>
            ) : (
              results.map((item, idx) => {
                const isSelected = idx === selectedIndex;

                if (item.type === 'flat') {
                  const flat = item.data as Flat;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#E9F3F5] border border-[#0F4C5C]/40 text-[#152226]'
                          : 'hover:bg-[#F2F5F3] text-[#152226]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={flat.image}
                          alt={flat.name}
                          className="w-12 h-12 rounded-lg object-cover bg-[#D0DDD7] shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-[#0F4C5C] uppercase tracking-wider">
                              Property
                            </span>
                            <span className="text-[10px] font-['Red_Hat_Mono'] text-[#4B5E63]">
                              ★ {flat.score}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold truncate text-[#152226]">{flat.name}</h4>
                          <p className="text-xs text-[#4B5E63] truncate">
                            {flat.locality} • {flat.config}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-['Red_Hat_Mono'] text-xs font-bold text-[#0F4C5C] tabular-nums">
                          {flat.price}
                        </div>
                        <span className="text-[10px] text-[#4B5E63]">{flat.carpet}</span>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'stock') {
                  const stock = item.data as DeveloperStock;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#E9F3F5] border border-[#0F4C5C]/40 text-[#152226]'
                          : 'hover:bg-[#F2F5F3] text-[#152226]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-[#FCE8E0] text-[#B44D27] flex items-center justify-center shrink-0">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-[#B44D27] uppercase tracking-wider">
                              Stock Quote
                            </span>
                            <span className="text-[10px] font-['Red_Hat_Mono'] text-[#4B5E63]">
                              {stock.ticker}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold truncate text-[#152226]">{stock.name}</h4>
                          <p className="text-xs text-[#4B5E63] truncate">HQ: {stock.hq} • Cap {stock.mcap}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-['Red_Hat_Mono'] text-xs font-bold text-[#152226] tabular-nums">
                          {stock.price}
                        </div>
                        <span
                          className={`text-[10px] font-['Red_Hat_Mono'] font-semibold tabular-nums ${
                            stock.positive ? 'text-[#1F7A4C]' : 'text-[#B91C1C]'
                          }`}
                        >
                          {stock.changeText}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'location') {
                  const loc = item.data as BuildingLocation;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#E9F3F5] border border-[#0F4C5C]/40 text-[#152226]'
                          : 'hover:bg-[#F2F5F3] text-[#152226]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-[#D2E8ED] text-[#0F4C5C] flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-[#0F4C5C] uppercase tracking-wider">
                              GIS Location
                            </span>
                            <span className="text-[10px] font-['Red_Hat_Mono'] text-[#4B5E63]">
                              {loc.stage}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold truncate text-[#152226]">{loc.name}</h4>
                          <p className="text-xs text-[#4B5E63] truncate">
                            {loc.companyName} • {loc.place}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-['Red_Hat_Mono'] text-xs font-bold text-[#152226] tabular-nums">
                          {loc.leadCount} Leads
                        </div>
                        <span className="text-[10px] text-[#1F7A4C] font-semibold">
                          {loc.avgConversion}% Conv
                        </span>
                      </div>
                    </div>
                  );
                }

                // Lead type
                const lead = item.data as BuyerLead;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#E9F3F5] border border-[#0F4C5C]/40 text-[#152226]'
                        : 'hover:bg-[#F2F5F3] text-[#152226]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-[#E9EFEA] text-[#152226] font-bold text-sm flex items-center justify-center shrink-0">
                        {lead.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#B44D27] uppercase tracking-wider">
                            Buyer Lead
                          </span>
                          <span className="text-[10px] font-['Red_Hat_Mono'] text-[#4B5E63]">
                            {lead.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold truncate text-[#152226]">{lead.name}</h4>
                        <p className="text-xs text-[#4B5E63] truncate">
                          {lead.project} • {lead.budget}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-['Red_Hat_Mono'] text-xs font-bold text-[#1F7A4C] tabular-nums">
                        {lead.probability}% Prob
                      </div>
                      <span className="text-[10px] text-[#4B5E63]">{lead.config}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Inspection Drawer: High Detail Preview */}
          <div className="hidden md:flex md:col-span-5 p-5 flex-col justify-between bg-[#F9FBFA] overflow-y-auto max-h-[500px]">
            {currentSelection ? (
              <div className="flex flex-col gap-4">
                {currentSelection.type === 'flat' && (
                  <>
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#D0DDD7]">
                      <img
                        src={(currentSelection.data as Flat).image}
                        alt={(currentSelection.data as Flat).name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-[#0F4C5C] text-white font-['Red_Hat_Mono'] text-xs font-bold">
                        Score {(currentSelection.data as Flat).score}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#0F4C5C] tracking-wider">
                        {(currentSelection.data as Flat).company}
                      </div>
                      <h3 className="font-['Montserrat'] text-base font-bold text-[#152226]">
                        {(currentSelection.data as Flat).name}
                      </h3>
                      <p className="text-xs text-[#4B5E63] mt-0.5">
                        {(currentSelection.data as Flat).locality}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#D0DDD7]">
                      <div>
                        <span className="text-[#4B5E63] block">Price</span>
                        <span className="font-['Red_Hat_Mono'] font-bold text-[#0F4C5C]">
                          {(currentSelection.data as Flat).price}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#4B5E63] block">Carpet Efficiency</span>
                        <span className="font-['Red_Hat_Mono'] font-bold text-[#152226]">
                          {(currentSelection.data as Flat).carpet}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#4B5E63] block">Unit Config</span>
                        <span className="font-['Red_Hat_Mono'] text-[#152226]">
                          {(currentSelection.data as Flat).config}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#4B5E63] block">Advance Token</span>
                        <span className="font-['Red_Hat_Mono'] font-bold text-[#B44D27]">
                          {(currentSelection.data as Flat).advance}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#4B5E63] line-clamp-3">
                      {(currentSelection.data as Flat).description}
                    </p>
                  </>
                )}

                {currentSelection.type === 'stock' && (
                  <>
                    <div className="p-4 rounded-xl bg-white border border-[#D0DDD7] flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
                          {(currentSelection.data as DeveloperStock).ticker}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D] font-bold">
                          {(currentSelection.data as DeveloperStock).score} Solvency
                        </span>
                      </div>
                      <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#152226]">
                        {(currentSelection.data as DeveloperStock).name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-['Red_Hat_Mono'] text-[#152226]">
                          {(currentSelection.data as DeveloperStock).price}
                        </span>
                        <span
                          className={`text-xs font-bold font-['Red_Hat_Mono'] ${
                            (currentSelection.data as DeveloperStock).positive
                              ? 'text-[#1F7A4C]'
                              : 'text-[#B91C1C]'
                          }`}
                        >
                          {(currentSelection.data as DeveloperStock).changeText}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-[#D0DDD7]">
                        <span className="text-[#4B5E63] block">Market Cap</span>
                        <span className="font-bold text-[#152226]">
                          {(currentSelection.data as DeveloperStock).mcap}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#D0DDD7]">
                        <span className="text-[#4B5E63] block">P/E Ratio</span>
                        <span className="font-bold text-[#152226]">
                          {(currentSelection.data as DeveloperStock).pe}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#4B5E63] line-clamp-3">
                      {(currentSelection.data as DeveloperStock).overview}
                    </p>
                  </>
                )}

                {currentSelection.type === 'location' && (
                  <>
                    <div className="p-4 rounded-xl bg-white border border-[#D0DDD7] flex flex-col gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#D2E8ED] text-[#09323D] font-bold self-start">
                        {(currentSelection.data as BuildingLocation).stage}
                      </span>
                      <h3 className="font-['Montserrat'] text-base font-bold text-[#152226]">
                        {(currentSelection.data as BuildingLocation).name}
                      </h3>
                      <p className="text-xs text-[#4B5E63]">
                        {(currentSelection.data as BuildingLocation).companyName} •{' '}
                        {(currentSelection.data as BuildingLocation).place}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-[#D0DDD7]">
                        <span className="text-[#4B5E63] block">Planned Units</span>
                        <span className="font-bold text-[#152226]">
                          {(currentSelection.data as BuildingLocation).units}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#D0DDD7]">
                        <span className="text-[#4B5E63] block">Active Leads</span>
                        <span className="font-bold text-[#0F4C5C]">
                          {(currentSelection.data as BuildingLocation).leadCount} Registered
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {currentSelection.type === 'lead' && (
                  <>
                    <div className="p-4 rounded-xl bg-white border border-[#D0DDD7] flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-[#FCE8E0] text-[#B44D27] font-bold">
                          {(currentSelection.data as BuyerLead).status}
                        </span>
                        <span className="text-xs font-bold text-[#1F7A4C] font-['Red_Hat_Mono']">
                          {(currentSelection.data as BuyerLead).probability}% Win Probability
                        </span>
                      </div>
                      <h3 className="font-['Montserrat'] text-base font-bold text-[#152226]">
                        {(currentSelection.data as BuyerLead).name}
                      </h3>
                      <p className="text-xs text-[#4B5E63]">
                        {(currentSelection.data as BuyerLead).occupation}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-[#D0DDD7]">
                        <span className="text-[#4B5E63] block">Budget Bracket</span>
                        <span className="font-bold text-[#152226]">
                          {(currentSelection.data as BuyerLead).budget}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#D0DDD7]">
                        <span className="text-[#4B5E63] block">Project of Interest</span>
                        <span className="font-bold text-[#0F4C5C] truncate block">
                          {(currentSelection.data as BuyerLead).project}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#4B5E63] line-clamp-3 italic">
                      &ldquo;{(currentSelection.data as BuyerLead).notes}&rdquo;
                    </p>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleSelectResult(currentSelection)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Open Selected Item</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-center my-auto text-xs text-[#4B5E63]">
                Select an item to view full specifications &amp; quick actions.
              </div>
            )}

            {/* Bottom Keyboard Nav Help */}
            <div className="pt-3 border-t border-[#D0DDD7] flex items-center justify-between text-[11px] text-[#4B5E63]">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D0DDD7]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D0DDD7]">↓</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D0DDD7]">↵</kbd> to select
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
