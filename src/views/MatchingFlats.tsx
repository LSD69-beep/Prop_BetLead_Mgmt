import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FLATS_DATABASE, DEVELOPERS_DATABASE } from '../data/mockData';
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  Layers,
  Building,
  BarChart3,
  Camera,
  Compass,
} from 'lucide-react';

export const MatchingFlats: React.FC = () => {
  const {
    selectedCity,
    selectedZone,
    preferredPurpose,
    preferredBedrooms,
    preferredBudget,
    savedFlatIds,
    toggleSaveFlat,
    navigate,
  } = useApp();

  const [activeCityFilter, setActiveCityFilter] = useState<string>(selectedCity);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>(
    selectedZone && selectedZone !== 'Advice' ? selectedZone : 'All'
  );
  const [activeBhkFilter, setActiveBhkFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [efficiencyFilter, setEfficiencyFilter] = useState<boolean>(false);
  const [hoveredFlatId, setHoveredFlatId] = useState<string | null>(null);

  // Filter flats
  const matchingFlats = FLATS_DATABASE.filter((flat) => {
    const matchesCity = activeCityFilter === 'All' || flat.city === activeCityFilter;
    const matchesZone = activeZoneFilter === 'All' || flat.zone === activeZoneFilter;
    const matchesBhk = activeBhkFilter === 'All' || flat.bedrooms === activeBhkFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      flat.name.toLowerCase().includes(q) ||
      flat.company.toLowerCase().includes(q) ||
      flat.locality.toLowerCase().includes(q) ||
      flat.zone.toLowerCase().includes(q);
    const carpetNum = parseInt(flat.carpet.replace(/\D/g, ''), 10) || 70;
    const matchesEfficiency = !efficiencyFilter || carpetNum >= 75;

    return matchesCity && matchesZone && matchesBhk && matchesSearch && matchesEfficiency;
  });

  // Portfolio Analytics KPIs
  const portfolioStats = useMemo(() => {
    const pool = matchingFlats.length > 0 ? matchingFlats : FLATS_DATABASE;
    const avgRate = Math.round(
      pool.reduce((s, f) => s + (parseInt(f.rate.replace(/[^\d]/g, ''), 10) || 12000), 0) /
        pool.length
    );
    const avgCarpet = Math.round(
      pool.reduce((s, f) => s + (parseInt(f.carpet.replace(/\D/g, ''), 10) || 74), 0) /
        pool.length
    );
    const avgScore = (
      pool.reduce((s, f) => s + (parseFloat(f.score) || 9.0), 0) / pool.length
    ).toFixed(1);
    const avgPriceCr = (
      pool.reduce((s, f) => s + f.priceNum, 0) /
      pool.length /
      100
    ).toFixed(2);
    return { avgRate, avgCarpet, avgScore, avgPriceCr };
  }, [matchingFlats]);

  const hoveredFlat = hoveredFlatId
    ? FLATS_DATABASE.find((f) => f.id === hoveredFlatId) || null
    : null;

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 bg-[#F2F5F3]">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Top Header Row with Stock Badge at the End */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#D0DDD7]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D] font-['Red_Hat_Mono'] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                RERA Verified
              </span>
              <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
                {selectedCity} • {selectedZone || 'East'} Zone
              </span>
            </div>

            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#152226] text-balance">
              Matching flats in your region
            </h1>

            <p className="text-sm text-[#4B5E63]">
              Showing verified properties matching {preferredPurpose} • {preferredBedrooms} • {preferredBudget}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('customer-developer-stocks')}
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#D0DDD7] hover:border-[#0F4C5C] shadow-xs hover:shadow-md transition-all cursor-pointer group"
              title="Inspect developer publicly listed stock data"
            >
              <span className="w-8 h-8 rounded-lg bg-[#FCE8E0] text-[#B44D27] flex items-center justify-center transition-transform group-hover:scale-105">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs text-[#4B5E63]">Market Health</span>
                <span className="text-sm font-bold text-[#152226]">Developer Stocks</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#D2E8ED] text-[#09323D] font-['Red_Hat_Mono'] text-xs font-bold tabular-nums">
                {DEVELOPERS_DATABASE.length}
              </span>
            </button>
          </div>
        </div>

        {/* Portfolio KPI Analytics Strip */}
        <section
          aria-label="Matching inventory analytics KPIs"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4B5E63]">Matched Properties</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
              {matchingFlats.length} / {FLATS_DATABASE.length}
            </span>
            <span className="text-[11px] text-[#4B5E63]">Unique verified assets</span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4B5E63]">Mean Unit Price</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold text-[#152226] tabular-nums">
              ₹{portfolioStats.avgPriceCr} Cr
            </span>
            <span className="text-[11px] font-['Red_Hat_Mono'] text-[#4B5E63] tabular-nums">
              Avg ₹{portfolioStats.avgRate.toLocaleString('en-IN')}/sq.ft
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4B5E63]">Mean Carpet Efficiency</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold text-[#1F7A4C] tabular-nums">
              {portfolioStats.avgCarpet}%
            </span>
            <span className="text-[11px] text-[#1F7A4C] font-medium">
              +{Math.max(0, portfolioStats.avgCarpet - 64)}% vs city median
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4B5E63]">Mean Diligence Score</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold text-[#B44D27] tabular-nums">
              ★ {portfolioStats.avgScore} / 10
            </span>
            <span className="text-[11px] text-[#4B5E63]">Shortlisted: {savedFlatIds.length} flats</span>
          </div>
        </section>

        {/* Spatial Intelligence: Efficiency Spectrum + Value vs Carpet Scatter Quadrant */}
        <section
          aria-label="Carpet area efficiency spectrum and price quadrant"
          className="p-5 sm:p-6 rounded-2xl bg-white border border-[#D0DDD7] shadow-xs flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F4C5C] flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                Spatial &amp; Value Intelligence Analytics
              </span>
              <h2 className="text-base font-bold text-[#152226]">
                Carpet Efficiency Spectrum &amp; Price-per-Sq.Ft Value Matrix
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEfficiencyFilter((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                efficiencyFilter
                  ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                  : 'bg-[#F2F5F3] text-[#4B5E63] hover:text-[#152226] border-[#D0DDD7]'
              }`}
            >
              ★ Only Super-Efficient (≥75% Carpet)
            </button>
          </div>

          {/* Efficiency Spectrum Meter */}
          <div className="relative pt-6 pb-4 px-2">
            <div className="h-3 w-full rounded-full bg-linear-to-r from-[#D0DDD7] via-[#D2E8ED] to-[#DCFCE7] relative">
              <div className="absolute top-[-22px] left-[50%] -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <span className="text-[10px] font-['Red_Hat_Mono'] font-bold text-[#0F4C5C] bg-white px-1.5 py-0.2 rounded border border-[#0F4C5C]/30 shadow-2xs">
                  75% Benchmark
                </span>
                <div className="w-0.5 h-5 bg-[#0F4C5C]" />
              </div>

              {(matchingFlats.length > 0 ? matchingFlats : FLATS_DATABASE.slice(0, 16)).map((f) => {
                const cNum = parseInt(f.carpet.replace(/\D/g, ''), 10) || 72;
                const pct = Math.max(5, Math.min(95, ((cNum - 70) / 10) * 100));
                const isHovered = hoveredFlatId === f.id;

                return (
                  <button
                    key={f.id}
                    type="button"
                    onMouseEnter={() => setHoveredFlatId(f.id)}
                    onMouseLeave={() => setHoveredFlatId(null)}
                    onClick={() => navigate('customer-flat-detail', { flatId: f.id })}
                    style={{ left: `${pct}%` }}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all cursor-pointer ${
                      cNum >= 75 ? 'bg-[#0F4C5C]' : 'bg-[#B44D27]'
                    } ${isHovered ? 'scale-150 z-20 ring-2 ring-[#0F4C5C]' : 'z-10'}`}
                    title={`${f.name} - ${f.carpet} (${f.price})`}
                  />
                );
              })}
            </div>

            <div className="flex justify-between text-[11px] font-['Red_Hat_Mono'] text-[#4B5E63] mt-2">
              <span>70% Standard Efficiency</span>
              <span className="text-[#0F4C5C] font-bold">75% GlassWindow Grade</span>
              <span>80% Bespoke Villa Efficiency</span>
            </div>
          </div>

          {/* Interactive SVG Scatter Quadrant: Carpet Efficiency (%) vs Rate (₹/sq.ft) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-4 border-t border-[#D0DDD7]/70">
            <div className="lg:col-span-8 bg-[#F9FBFA] rounded-xl border border-[#D0DDD7] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#152226]">
                  Value Quadrant: Carpet Usability (%) vs. Rate (₹/sq.ft)
                </span>
                <span className="text-[11px] font-['Red_Hat_Mono'] text-[#4B5E63]">
                  Click any node to inspect unit
                </span>
              </div>
              <svg viewBox="0 0 600 180" className="w-full h-44 overflow-visible">
                {/* Quadrant guide lines */}
                <line x1="50" y1="90" x2="580" y2="90" stroke="#D0DDD7" strokeDasharray="4 4" />
                <line x1="315" y1="15" x2="315" y2="155" stroke="#D0DDD7" strokeDasharray="4 4" />
                {/* Sweet spot highlight (bottom right: high carpet >=75%, competitive rate) */}
                <rect
                  x="315"
                  y="90"
                  width="265"
                  height="65"
                  fill="#DCFCE7"
                  fillOpacity="0.45"
                  rx="6"
                />
                <text x="572" y="148" textAnchor="end" className="text-[10px] font-bold fill-[#14532D]">
                  Optimal Value Zone (≥75% Carpet)
                </text>

                {/* Axes Labels */}
                <text x="50" y="172" className="text-[10px] font-['Red_Hat_Mono'] fill-[#4B5E63]">
                  70% Carpet
                </text>
                <text
                  x="580"
                  y="172"
                  textAnchor="end"
                  className="text-[10px] font-['Red_Hat_Mono'] fill-[#4B5E63]"
                >
                  80% Carpet
                </text>
                <text x="44" y="22" textAnchor="end" className="text-[10px] font-['Red_Hat_Mono'] fill-[#4B5E63]">
                  ₹25k+
                </text>
                <text x="44" y="152" textAnchor="end" className="text-[10px] font-['Red_Hat_Mono'] fill-[#4B5E63]">
                  ₹8k
                </text>

                {FLATS_DATABASE.map((f) => {
                  const carpetNum = parseInt(f.carpet.replace(/\D/g, ''), 10) || 74;
                  const rateNum = Math.min(
                    26000,
                    Math.max(8000, parseInt(f.rate.replace(/[^\d]/g, ''), 10) || 12000)
                  );
                  const x = 50 + ((Math.min(80, Math.max(70, carpetNum)) - 70) / 10) * 530;
                  const y = 155 - ((rateNum - 8000) / 18000) * 140;
                  const isActive = matchingFlats.some((mf) => mf.id === f.id);
                  const isHovered = hoveredFlatId === f.id;
                  return (
                    <circle
                      key={f.id}
                      cx={x}
                      cy={y}
                      r={isHovered ? 8 : isActive ? 5.5 : 4}
                      fill={
                        f.city === 'Bangalore'
                          ? '#0F4C5C'
                          : f.city === 'Hyderabad'
                          ? '#1F7A4C'
                          : '#B44D27'
                      }
                      fillOpacity={isActive ? 0.95 : 0.3}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredFlatId(f.id)}
                      onMouseLeave={() => setHoveredFlatId(null)}
                      onClick={() => navigate('customer-flat-detail', { flatId: f.id })}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 p-4 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7]">
              <span className="text-xs font-bold text-[#152226]">Inspector Readout</span>
              {hoveredFlat ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-['Red_Hat_Mono'] font-bold text-[#0F4C5C]">
                    {hoveredFlat.city} • {hoveredFlat.zone} Zone
                  </span>
                  <h4 className="font-bold text-sm text-[#152226]">{hoveredFlat.name}</h4>
                  <p className="text-xs text-[#4B5E63]">{hoveredFlat.locality}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#D0DDD7] text-xs font-['Red_Hat_Mono'] font-bold">
                    <span className="text-[#0F4C5C]">{hoveredFlat.price}</span>
                    <span className="text-[#1F7A4C]">{hoveredFlat.carpet}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-xs text-[#4B5E63]">
                  <p>Hover any dot on the efficiency spectrum or value quadrant to inspect unit metrics.</p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold">
                    <span className="flex items-center gap-1 text-[#0F4C5C]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C5C]" /> Bangalore
                    </span>
                    <span className="flex items-center gap-1 text-[#1F7A4C]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A4C]" /> Hyderabad
                    </span>
                    <span className="flex items-center gap-1 text-[#B44D27]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B44D27]" /> Delhi NCR
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search & Quick Filter Bar */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-white border border-[#D0DDD7] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter flats by developer, project, zone or locality..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-xs text-[#152226] placeholder-[#8FA3A8] focus:bg-white focus:border-[#0F4C5C] outline-hidden font-medium"
              />
              <span className="material-symbols-outlined text-[18px] text-[#4B5E63] absolute left-2.5 top-2.5 pointer-events-none">
                search
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-[#4B5E63] hover:text-[#152226] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63] tabular-nums whitespace-nowrap">
              Showing <strong className="text-[#0F4C5C]">{matchingFlats.length}</strong> of {FLATS_DATABASE.length} flats
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D0DDD7]/70">
            <span className="text-xs font-semibold text-[#4B5E63] flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> City:
            </span>

            {['All', 'Bangalore', 'Hyderabad', 'Delhi'].map((c) => (
              <button
                key={c}
                onClick={() => setActiveCityFilter(c)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeCityFilter === c
                    ? 'bg-[#0F4C5C] text-white shadow-xs'
                    : 'bg-[#F2F5F3] text-[#4B5E63] hover:text-[#152226]'
                }`}
              >
                {c}
              </button>
            ))}

            <span className="text-[#D0DDD7] mx-1">|</span>

            <span className="text-xs font-semibold text-[#4B5E63] flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5" /> Zone:
            </span>

            {['All', 'North', 'South', 'East', 'West'].map((z) => (
              <button
                key={z}
                onClick={() => setActiveZoneFilter(z)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeZoneFilter === z
                    ? 'bg-[#B44D27] text-white shadow-xs'
                    : 'bg-[#F2F5F3] text-[#4B5E63] hover:text-[#152226]'
                }`}
              >
                {z === 'All' ? 'All Zones' : z}
              </button>
            ))}

            <span className="text-[#D0DDD7] mx-1">|</span>

            {['All', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map((b) => (
              <button
                key={b}
                onClick={() => setActiveBhkFilter(b)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeBhkFilter === b
                    ? 'bg-[#0F4C5C] text-white shadow-xs'
                    : 'bg-[#F2F5F3] text-[#4B5E63] hover:text-[#152226]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Flats Grid */}
        <section
          aria-label="Available flats list"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        >
          {matchingFlats.map((flat) => {
            const isSaved = savedFlatIds.includes(flat.id);
            return (
              <article
                key={flat.id}
                className="rounded-2xl bg-white border border-[#D0DDD7] hover:border-[#0F4C5C] p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-5 group"
              >
                <div className="flex flex-col gap-4">
                  <div className="relative h-52 w-full rounded-xl overflow-hidden bg-[#E9EFEA]">
                    <img
                      src={flat.image}
                      alt={flat.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveFlat(flat.id)}
                        title={isSaved ? 'Remove from shortlist' : 'Shortlist flat'}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-xs text-[#0F4C5C] flex items-center justify-center hover:bg-white shadow-xs cursor-pointer transition-colors"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-[#B44D27]" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-md bg-[#0F4C5C]/90 backdrop-blur-xs text-white font-['Red_Hat_Mono'] text-xs font-semibold tabular-nums">
                        ★ {flat.score}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[#152226] text-xs font-medium">
                        {flat.city} • {flat.zone}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/65 backdrop-blur-xs text-white font-['Red_Hat_Mono'] text-[11px] font-semibold">
                        <Camera className="w-3 h-3" />
                        {flat.galleryImages?.length || 6} Photos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#0F4C5C] flex items-center gap-1">
                        <Building className="w-3 h-3" /> {flat.company}
                      </span>
                      <h3 className="font-['Montserrat'] text-xl font-bold text-[#152226] mt-0.5">
                        {flat.name}
                      </h3>
                      <p className="text-xs text-[#4B5E63] mt-0.5">{flat.locality}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#14532D] font-['Red_Hat_Mono'] text-xs font-semibold tabular-nums shrink-0">
                      RERA Audited
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#D0DDD7]">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#4B5E63]">Price</span>
                      <span className="font-['Red_Hat_Mono'] text-lg font-bold text-[#152226] tabular-nums">
                        {flat.price}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-[#4B5E63]">Carpet Area Efficiency</span>
                      <span className="font-['Red_Hat_Mono'] text-lg font-bold text-[#0F4C5C] tabular-nums flex items-center gap-1">
                        <Layers className="w-4 h-4 text-[#0F4C5C]" />
                        {flat.carpet}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B5E63] font-['Red_Hat_Mono'] tabular-nums">
                    <span>{flat.config} • {flat.rate}</span>
                    <span className="text-[#0F4C5C] font-semibold">
                      {flat.floor} • {flat.possession || 'Ready / 2026'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {flat.amenities.slice(0, 3).map((am) => (
                      <span
                        key={am}
                        className="px-2 py-0.5 rounded bg-[#F2F5F3] border border-[#D0DDD7]/80 text-[11px] text-[#4B5E63]"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('customer-flat-detail', { flatId: flat.id })}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-sm transition-all duration-150 cursor-pointer shadow-xs"
                >
                  <span>Find More &amp; View Specifications</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </article>
            );
          })}
        </section>

        {matchingFlats.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#D0DDD7] flex flex-col items-center gap-3">
            <Building className="w-8 h-8 text-[#8FA3A8]" />
            <h3 className="text-base font-bold text-[#152226]">No flats match the current filters</h3>
            <p className="text-xs text-[#4B5E63]">
              Try resetting the city or bedroom filters to explore other regions.
            </p>
            <button
              onClick={() => {
                setActiveCityFilter('All');
                setActiveZoneFilter('All');
                setActiveBhkFilter('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-[#0F4C5C] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
