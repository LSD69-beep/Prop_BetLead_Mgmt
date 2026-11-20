import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { City, DirectionZone } from '../types';
import { CITY_AREAS, FLATS_DATABASE } from '../data/mockData';
import { GoogleCityMap } from '../components/GoogleCityMap';
import { MapPin, ArrowRight, HelpCircle, Check, Compass, BarChart3, Layers } from 'lucide-react';

const CITIES: City[] = ['Hyderabad', 'Bangalore', 'Delhi'];

const CITY_HIGHLIGHTS: Record<
  City,
  { image: string; title: string; subtitle: string; highlights: string[] }
> = {
  Bangalore: {
    image: '/src/assets/images/bangalore_city_map_1795171378680.jpg',
    title: 'Bengaluru (Bangalore) Zone Explorer',
    subtitle: 'Interactive Google Maps • Tech Corridors & Namma Metro',
    highlights: [
      'Outer Ring Road (ORR)',
      'Bellary Rd NH44 (Airport)',
      'Whitefield & E-City Hubs',
      'Namma Metro Network',
    ],
  },
  Hyderabad: {
    image: '/src/assets/images/hyderabad_city_map_1795171395792.jpg',
    title: 'Hyderabad Metropolitan Zone Explorer',
    subtitle: 'Interactive Google Maps • Financial District & Cyberabad',
    highlights: [
      'Nehru Outer Ring Road (ORR)',
      'PVNR Elevated Expressway',
      'HITEC City & Gachibowli',
      'Kokapet Neopolis Hub',
    ],
  },
  Delhi: {
    image: '/src/assets/images/delhi_ncr_city_map_1795171396669.jpg',
    title: 'Delhi NCR Zone Explorer',
    subtitle: 'Interactive Google Maps • Lutyens, Okhla & Gurugram',
    highlights: [
      'Inner & Outer Ring Roads',
      'Dwarka Expressway',
      'Cyber City & Golf Course Rd',
      'Okhla & Moti Nagar Enclaves',
    ],
  },
};

export const CitySelection: React.FC = () => {
  const { selectedCity, setSelectedCity, selectedZone, setSelectedZone, navigate } = useApp();
  const [mapViewMode, setMapViewMode] = useState<'google' | 'schematic'>('google');

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
    if (!selectedZone || selectedZone === 'Advice') {
      setSelectedZone('East');
    }
  };

  const handleZoneSelect = (zone: DirectionZone) => {
    setSelectedZone(zone);
  };

  const handleContinue = () => {
    navigate('customer-preferences');
  };

  const currentAreas = CITY_AREAS[selectedCity];

  const zoneAnalytics = useMemo(() => {
    const cityFlats = FLATS_DATABASE.filter((f) => f.city === selectedCity);
    const activePool =
      selectedZone && selectedZone !== 'Advice'
        ? cityFlats.filter((f) => f.zone === selectedZone)
        : cityFlats;
    const pool = activePool.length > 0 ? activePool : cityFlats;

    const avgRate =
      pool.length > 0
        ? Math.round(
            pool.reduce((sum, f) => sum + (parseInt(f.rate.replace(/[^\d]/g, ''), 10) || 12000), 0) /
              pool.length
          )
        : 0;
    const avgCarpet =
      pool.length > 0
        ? Math.round(
            pool.reduce((sum, f) => sum + (parseInt(f.carpet.replace(/\D/g, ''), 10) || 74), 0) /
              pool.length
          )
        : 0;
    const avgScore =
      pool.length > 0
        ? (
            pool.reduce((sum, f) => sum + (parseFloat(f.score) || 9.0), 0) / pool.length
          ).toFixed(1)
        : '9.0';

    return {
      cityCount: cityFlats.length,
      zoneCount: activePool.length,
      avgRate,
      avgCarpet,
      avgScore,
    };
  }, [selectedCity, selectedZone]);

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 bg-[#F2F5F3]">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
        {/* Top City Slider Bar */}
        <section aria-label="Select city" className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4B5E63]">
            Select your city
          </span>
          <div className="w-full max-w-xl">
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-white border border-[#D0DDD7] shadow-xs gap-1.5">
              {CITIES.map((city) => {
                const isSelected = selectedCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCityChange(city)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F4C5C] text-white shadow-sm'
                        : 'text-[#4B5E63] hover:text-[#152226] hover:bg-[#F2F5F3]'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{city}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* City & Zone Analytics Strip */}
        <section
          aria-label="Zone market analytics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[#4B5E63]">
              Audited Inventory ({selectedCity})
            </span>
            <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
              {zoneAnalytics.cityCount} Flats
            </span>
            <span className="text-[11px] text-[#4B5E63]">
              {selectedZone && selectedZone !== 'Advice'
                ? `${zoneAnalytics.zoneCount} directly in ${selectedZone} zone`
                : 'Full metro coverage'}
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[#4B5E63]">
              Avg Micro-Market Rate
            </span>
            <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#152226] tabular-nums">
              ₹{zoneAnalytics.avgRate.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#4B5E63]">Per sq.ft super built-up</span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[#4B5E63]">
              Mean Carpet Efficiency
            </span>
            <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#1F7A4C] tabular-nums flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-[#1F7A4C]" />
              {zoneAnalytics.avgCarpet}%
            </span>
            <span className="text-[11px] text-[#1F7A4C] font-medium">
              +{Math.max(0, zoneAnalytics.avgCarpet - 64)}% vs city median
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[#4B5E63]">
              Mean Diligence Score
            </span>
            <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#B44D27] tabular-nums flex items-center gap-1.5">
              <BarChart3 className="w-5 h-5 text-[#B44D27]" />
              ★ {zoneAnalytics.avgScore} / 10
            </span>
            <span className="text-[11px] text-[#4B5E63]">80-point RERA &amp; structural check</span>
          </div>
        </section>

        {/* Split Card: Left 4 Directional Options + Right Live Google City Map */}
        <section className="rounded-2xl bg-white border border-[#D0DDD7] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Half: 4 Directional Options */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#4B5E63]">
                  Tell us about your home.
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D] text-xs font-['Red_Hat_Mono'] font-semibold tabular-nums">
                  1/4
                </span>
              </div>

              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#152226] text-balance">
                What&apos;s your preferred area in {selectedCity}?
              </h1>

              {/* 4 Area Options: North, South, East, West */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(['North', 'South', 'East', 'West'] as DirectionZone[]).map((zone) => {
                  const isSelected = selectedZone === zone;
                  const countInZone = FLATS_DATABASE.filter(
                    (f) => f.city === selectedCity && f.zone === zone
                  ).length;
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => handleZoneSelect(zone)}
                      className={`text-left rounded-xl p-4 flex flex-col gap-1 transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#0F4C5C] bg-[#D2E8ED]/30 ring-1 ring-[#0F4C5C]'
                          : 'border-[#D0DDD7] bg-white hover:border-[#0F4C5C]/60 hover:bg-[#F2F5F3]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base text-[#152226]">{zone}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-['Red_Hat_Mono'] font-semibold text-[#0F4C5C] bg-[#E9EFEA] px-1.5 py-0.5 rounded">
                            {countInZone} flats
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#0F4C5C]" />}
                        </div>
                      </div>
                      <span className="text-xs text-[#4B5E63] leading-relaxed">
                        {currentAreas[zone as keyof typeof currentAreas]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Need Advice Card */}
              <button
                type="button"
                onClick={() => handleZoneSelect('Advice')}
                className={`w-full text-left rounded-xl p-4 flex items-center justify-between gap-3 border transition-all cursor-pointer ${
                  selectedZone === 'Advice'
                    ? 'border-[#0F4C5C] bg-[#D2E8ED]/30 ring-1 ring-[#0F4C5C]'
                    : 'border-[#D0DDD7] bg-[#F2F5F3] hover:border-[#0F4C5C]/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#D0DDD7] text-[#0F4C5C] flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-[#152226]">
                      Need Advisory Consultation
                    </span>
                    <span className="text-xs text-[#4B5E63]">
                      We&apos;ve helped 1,500+ families evaluate commute, water security &amp; appreciation.
                    </span>
                  </div>
                </div>
                {selectedZone === 'Advice' && <Check className="w-4 h-4 text-[#0F4C5C] shrink-0" />}
              </button>

              {/* Zone Feedback */}
              {selectedZone && (
                <div className="p-3 rounded-lg bg-[#DCFCE7] text-[#14532D] text-xs font-medium flex items-center gap-2">
                  <Compass className="w-4 h-4 shrink-0 text-[#1F7A4C]" />
                  <span>
                    {selectedZone === 'Advice'
                      ? `A certified GlassWindow advisor in ${selectedCity} will help you select the ideal sub-region.`
                      : `Selected ${selectedZone} ${selectedCity} (${currentAreas[selectedZone as keyof typeof currentAreas]}) — logged to unified database.`}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleContinue}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-sm transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md"
              >
                <span>Continue to Home Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#4B5E63]">
              Every city or directional zone update is recorded in the unified database to keep your advisor brief synchronized.
            </p>
          </div>

          {/* Right Half: Interactive Google Maps Explorer */}
          <div className="lg:col-span-6 bg-[#E9EFEA] border-t lg:border-t-0 lg:border-l border-[#D0DDD7] p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div className="w-full flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#0F4C5C] font-['Red_Hat_Mono']">
                  Google Maps Platform GIS
                </span>
                <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#152226]">
                  {CITY_HIGHLIGHTS[selectedCity].title}
                </h3>
              </div>

              <div className="flex items-center p-1 rounded-lg bg-white border border-[#D0DDD7] gap-1">
                <button
                  type="button"
                  onClick={() => setMapViewMode('google')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    mapViewMode === 'google'
                      ? 'bg-[#0F4C5C] text-white'
                      : 'text-[#4B5E63] hover:text-[#152226]'
                  }`}
                >
                  Live Map
                </button>
                <button
                  type="button"
                  onClick={() => setMapViewMode('schematic')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    mapViewMode === 'schematic'
                      ? 'bg-[#0F4C5C] text-white'
                      : 'text-[#4B5E63] hover:text-[#152226]'
                  }`}
                >
                  Corridor Chart
                </button>
              </div>
            </div>

            {mapViewMode === 'google' ? (
              <GoogleCityMap
                mode="city-zones"
                city={selectedCity}
                selectedZone={selectedZone}
                onSelectZone={(z) => handleZoneSelect(z)}
                onInspectFlat={(flatId) => navigate('customer-flat-detail', { flatId })}
                heightClass="h-[380px] sm:h-[420px]"
              />
            ) : (
              <div className="w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-[#D0DDD7] bg-white shadow-md relative">
                <img
                  src={CITY_HIGHLIGHTS[selectedCity].image}
                  alt={`${selectedCity} city cartographic map`}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium font-['Red_Hat_Mono']">
                  {selectedCity} • GIS Corridor Reference
                </div>
              </div>
            )}

            {/* Micro-Market Highlights */}
            <div className="w-full p-3 rounded-xl bg-white border border-[#D0DDD7] flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-[#4B5E63]">
                Key Arteries &amp; Micro-Markets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CITY_HIGHLIGHTS[selectedCity].highlights.map((h) => (
                  <span
                    key={h}
                    className="px-2 py-0.5 rounded-md bg-[#F2F5F3] border border-[#D0DDD7] text-[11px] font-medium text-[#152226]"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
