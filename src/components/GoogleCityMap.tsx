import React, { useState, useMemo } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Circle,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { BuildingLocation, City, DirectionZone, Flat } from '../types';
import { FLATS_DATABASE } from '../data/mockData';
import { ActualCityMap } from './ActualCityMap';
import { MapPin, Compass, Layers, Users, ArrowRight, KeyRound, Navigation } from 'lucide-react';

interface CityZonesMapProps {
  mode: 'city-zones';
  city: City;
  selectedZone: DirectionZone | null;
  onSelectZone: (zone: DirectionZone) => void;
  onInspectFlat?: (flatId: string) => void;
  heightClass?: string;
}

interface CompanyProjectsMapProps {
  mode: 'company-projects';
  buildings: BuildingLocation[];
  selectedCompany: string;
  onSelectBuilding: (building: BuildingLocation) => void;
  heightClass?: string;
}

interface FlatDetailMapProps {
  mode: 'flat-detail';
  flat: Flat;
  onSelectComparable?: (flatId: string) => void;
  heightClass?: string;
}

type GoogleCityMapProps = CityZonesMapProps | CompanyProjectsMapProps | FlatDetailMapProps;

const CITY_CENTERS: Record<City, { lat: number; lng: number; zoom: number }> = {
  Bangalore: { lat: 12.945, lng: 77.655, zoom: 11 },
  Hyderabad: { lat: 17.425, lng: 78.385, zoom: 11 },
  Delhi: { lat: 28.535, lng: 77.185, zoom: 10 },
};

const ZONE_CENTERS: Record<
  City,
  Record<'North' | 'South' | 'East' | 'West', { lat: number; lng: number; label: string }>
> = {
  Bangalore: {
    North: { lat: 13.065, lng: 77.595, label: 'Hebbal • Yelahanka • Devanahalli' },
    South: { lat: 12.885, lng: 77.585, label: 'Jayanagar • JP Nagar • Kanakapura Rd' },
    East: { lat: 12.968, lng: 77.735, label: 'Whitefield • Varthur • Panathur' },
    West: { lat: 12.978, lng: 77.535, label: 'Rajajinagar • Malleswaram • Vijayanagar' },
  },
  Hyderabad: {
    North: { lat: 17.498, lng: 78.415, label: 'Kompally • Secunderabad • Miyapur' },
    South: { lat: 17.315, lng: 78.445, label: 'Shamshabad • Rajendranagar • Adibatla' },
    East: { lat: 17.395, lng: 78.555, label: 'Uppal • LB Nagar • Pocharam' },
    West: { lat: 17.415, lng: 78.338, label: 'HITEC City • Financial Dist • Kokapet' },
  },
  Delhi: {
    North: { lat: 28.705, lng: 77.185, label: 'Civil Lines • Rohini • Pitampura' },
    South: { lat: 28.495, lng: 77.195, label: 'GK • Okhla • Golf Course Rd NCR' },
    East: { lat: 28.605, lng: 77.315, label: 'Mayur Vihar • Noida Sec 150 • Indirapuram' },
    West: { lat: 28.635, lng: 77.085, label: 'Punjabi Bagh • Moti Nagar • Dwarka' },
  },
};

const STAGE_PIN_COLORS: Record<string, { bg: string; border: string; glyph: string }> = {
  'Already Present': { bg: '#1F7A4C', border: '#14532D', glyph: '#FFFFFF' },
  'Under Construction': { bg: '#0F4C5C', border: '#09323D', glyph: '#FFFFFF' },
  'About to Start': { bg: '#B44D27', border: '#5C220D', glyph: '#FFFFFF' },
};

const getApproxKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLat = (lat2 - lat1) * 111;
  const dLng = (lng2 - lng1) * 111 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

interface MapFallbackProps {
  props: GoogleCityMapProps;
  reason: 'missing-key' | 'load-error';
  cityCenter: { lat: number; lng: number; zoom: number };
}

const MapFallbackView: React.FC<MapFallbackProps> = ({ props, reason, cityCenter }) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

  const loadErrorBanner =
    reason === 'load-error' ? (
      <div className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
        <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          Live Google Maps tiles unavailable (key restriction, billing, or quota). Interactive cartographic view active.
        </span>
      </div>
    ) : null;

  if (props.mode === 'city-zones') {
    return (
      <div className="w-full rounded-2xl border border-[#D0DDD7] bg-white p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
        {loadErrorBanner}
        <ActualCityMap
          city={props.city}
          selectedZone={props.selectedZone}
          onSelectZone={props.onSelectZone}
        />
      </div>
    );
  }

  if (props.mode === 'company-projects') {
    const lats = props.buildings.map((b) => b.lat);
    const lngs = props.buildings.map((b) => b.lng);
    const minLat = lats.length > 0 ? Math.min(...lats) : cityCenter.lat - 0.1;
    const maxLat = lats.length > 0 ? Math.max(...lats) : cityCenter.lat + 0.1;
    const minLng = lngs.length > 0 ? Math.min(...lngs) : cityCenter.lng - 0.1;
    const maxLng = lngs.length > 0 ? Math.max(...lngs) : cityCenter.lng + 0.1;
    const latSpan = Math.max(0.08, maxLat - minLat);
    const lngSpan = Math.max(0.08, maxLng - minLng);

    const activeBuilding =
      props.buildings.find((b) => b.id === selectedBuildingId) || props.buildings[0] || null;

    return (
      <div className="w-full rounded-2xl border border-[#D0DDD7] bg-[#F8FAF9] p-4 sm:p-5 flex flex-col gap-4">
        {loadErrorBanner}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-['Red_Hat_Mono'] font-bold uppercase tracking-wider text-[#0F4C5C]">
            <Compass className="w-3.5 h-3.5" />
            Interactive Portfolio GIS • {props.buildings.length} Sites
          </span>
          <span className="font-['Red_Hat_Mono'] text-[10px] text-[#4B5E63] bg-white px-2.5 py-1 rounded-md border border-[#D0DDD7]">
            Center: {cityCenter.lat.toFixed(3)}°N, {cityCenter.lng.toFixed(3)}°E
          </span>
        </div>

        {/* Spatial Coordinate Plot */}
        {props.buildings.length > 0 && (
          <div className="w-full h-[220px] rounded-xl bg-white border border-[#D0DDD7] relative overflow-hidden">
            <svg
              viewBox="0 0 600 220"
              className="w-full h-full"
              role="img"
              aria-label={`${props.selectedCompany} spatial site coordinates`}
            >
              <defs>
                <pattern id="portfolio-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2E8F0" strokeWidth="0.7" />
                </pattern>
              </defs>
              <rect width="600" height="220" fill="url(#portfolio-grid)" />
              <line x1="300" y1="12" x2="300" y2="208" stroke="#CBD5E1" strokeDasharray="4 4" />
              <line x1="20" y1="110" x2="580" y2="110" stroke="#CBD5E1" strokeDasharray="4 4" />

              {props.buildings.map((b) => {
                const x = 60 + ((b.lng - minLng) / lngSpan) * 480;
                const y = 185 - ((b.lat - minLat) / latSpan) * 150;
                const colors = STAGE_PIN_COLORS[b.stage] || STAGE_PIN_COLORS['Under Construction'];
                const isActive = activeBuilding?.id === b.id;
                return (
                  <g
                    key={b.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedBuildingId(b.id)}
                    className="cursor-pointer"
                  >
                    {isActive && (
                      <circle r="18" fill={colors.bg} fillOpacity="0.16" stroke={colors.bg} strokeWidth="1.5" />
                    )}
                    <circle
                      r={isActive ? 9 : 7}
                      fill={colors.bg}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      y="-13"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="#152226"
                    >
                      {b.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {props.buildings.map((b) => {
            const colors = STAGE_PIN_COLORS[b.stage] || STAGE_PIN_COLORS['Under Construction'];
            const isActive = activeBuilding?.id === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => props.onSelectBuilding(b)}
                onMouseEnter={() => setSelectedBuildingId(b.id)}
                className={`text-left rounded-xl bg-white border p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isActive ? 'border-[#B44D27] ring-1 ring-[#B44D27]/30' : 'border-[#D0DDD7] hover:border-[#B44D27]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-['Red_Hat_Mono'] font-bold text-white"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <MapPin className="w-3 h-3" />
                    {b.stage}
                  </span>
                  <span className="font-['Red_Hat_Mono'] text-[10px] text-[#4B5E63]">
                    {b.lat.toFixed(3)}°N, {b.lng.toFixed(3)}°E
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-[#152226]">{b.name}</div>
                  <div className="text-[11px] text-[#4B5E63] mt-0.5">{b.place}</div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#D0DDD7] text-[11px] font-['Red_Hat_Mono']">
                  <span className="text-[#0F4C5C] font-bold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {b.leadCount} Leads ({b.avgConversion}%)
                  </span>
                  <span className="text-[#B44D27] font-semibold inline-flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // mode === 'flat-detail'
  const nearbyComparables = FLATS_DATABASE.filter(
    (f) => f.city === props.flat.city && f.id !== props.flat.id
  )
    .map((f) => ({
      flat: f,
      distanceKm: getApproxKm(props.flat.lat, props.flat.lng, f.lat, f.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);

  return (
    <div className="w-full rounded-2xl border border-[#D0DDD7] bg-[#F8FAF9] p-4 sm:p-5 flex flex-col gap-4">
      {loadErrorBanner}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-['Red_Hat_Mono'] font-bold uppercase tracking-wider text-[#0F4C5C]">
          <Compass className="w-3.5 h-3.5" />
          2km Micro-Market Spatial Radar • {props.flat.city}
        </span>
        <span className="font-['Red_Hat_Mono'] text-[10px] text-[#0F4C5C] bg-white px-2.5 py-1 rounded-md border border-[#D0DDD7]">
          GPS: {props.flat.lat.toFixed(4)}°N, {props.flat.lng.toFixed(4)}°E
        </span>
      </div>

      {/* Micro-Market Radar Visualization */}
      <div className="w-full h-[210px] rounded-xl bg-white border border-[#D0DDD7] relative overflow-hidden">
        <svg
          viewBox="0 0 600 210"
          className="w-full h-full"
          role="img"
          aria-label={`Micro-market radar around ${props.flat.name}`}
        >
          <defs>
            <pattern id="radar-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="600" height="210" fill="url(#radar-grid)" />
          <circle cx="300" cy="105" r="88" fill="#0F4C5C" fillOpacity="0.05" stroke="#0F4C5C" strokeOpacity="0.3" strokeDasharray="4 4" />
          <circle cx="300" cy="105" r="46" fill="#0F4C5C" fillOpacity="0.08" stroke="#0F4C5C" strokeOpacity="0.4" />

          {nearbyComparables.map(({ flat: comp, distanceKm }, idx) => {
            const angle = (idx * Math.PI) / 2 + Math.PI / 5;
            const radius = Math.min(82, Math.max(36, distanceKm * 8));
            const x = 300 + Math.cos(angle) * radius * 1.65;
            const y = 105 + Math.sin(angle) * radius * 0.9;
            const isHighlighted = selectedCompId === comp.id;
            return (
              <g
                key={comp.id}
                onClick={() => {
                  setSelectedCompId(comp.id);
                  props.onSelectComparable?.(comp.id);
                }}
                onMouseEnter={() => setSelectedCompId(comp.id)}
                className="cursor-pointer"
              >
                <line x1="300" y1="105" x2={x} y2={y} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                <circle
                  cx={x}
                  cy={y}
                  r={isHighlighted ? 8 : 6.5}
                  fill="#0F4C5C"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 11}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#152226"
                >
                  {comp.name} ({distanceKm.toFixed(1)} km)
                </text>
              </g>
            );
          })}

          {/* Center Anchor Property */}
          <g>
            <circle cx="300" cy="105" r="14" fill="#B44D27" fillOpacity="0.2" />
            <circle cx="300" cy="105" r="8" fill="#B44D27" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x="300" y="128" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#B44D27">
              {props.flat.name}
            </text>
          </g>
        </svg>
      </div>

      <div className="rounded-xl bg-white border border-[#0F4C5C]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#B44D27] text-white flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-['Red_Hat_Mono'] font-bold uppercase text-[#B44D27]">
              Active Property Anchor • {props.flat.zone} {props.flat.city}
            </span>
            <h4 className="font-bold text-sm text-[#152226]">{props.flat.name}</h4>
            <p className="text-xs text-[#4B5E63]">{props.flat.locality}</p>
          </div>
        </div>
        <div className="font-['Red_Hat_Mono'] text-xs font-bold text-[#0F4C5C]">
          {props.flat.price} • {props.flat.carpet}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nearbyComparables.map(({ flat: comp, distanceKm }) => (
          <div
            key={comp.id}
            onMouseEnter={() => setSelectedCompId(comp.id)}
            className={`rounded-xl bg-white border p-3.5 flex items-center justify-between gap-3 transition-colors ${
              selectedCompId === comp.id ? 'border-[#0F4C5C]' : 'border-[#D0DDD7]'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-['Red_Hat_Mono'] text-[#0F4C5C] font-bold">
                <span>{distanceKm.toFixed(1)} km away</span>
                <span>•</span>
                <span>{comp.zone} Zone</span>
              </div>
              <div className="font-semibold text-xs text-[#152226] truncate mt-0.5">
                {comp.name}
              </div>
              <div className="text-[11px] text-[#4B5E63] truncate">
                {comp.price} • {comp.rate}
              </div>
            </div>
            {props.onSelectComparable && (
              <button
                type="button"
                onClick={() => props.onSelectComparable?.(comp.id)}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#0F4C5C] hover:bg-[#09323D] text-white text-[11px] font-semibold cursor-pointer"
              >
                Compare
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const getCityCenterForProps = (props: GoogleCityMapProps) => {
  if (props.mode === 'city-zones') {
    if (props.selectedZone && props.selectedZone !== 'Advice') {
      const z = ZONE_CENTERS[props.city][props.selectedZone];
      return { lat: z.lat, lng: z.lng, zoom: 12 };
    }
    return CITY_CENTERS[props.city];
  }
  if (props.mode === 'flat-detail') {
    return { lat: props.flat.lat, lng: props.flat.lng, zoom: 13 };
  }
  if (props.mode === 'company-projects' && props.buildings.length > 0) {
    const avgLat =
      props.buildings.reduce((sum, b) => sum + b.lat, 0) / props.buildings.length;
    const avgLng =
      props.buildings.reduce((sum, b) => sum + b.lng, 0) / props.buildings.length;
    return { lat: avgLat, lng: avgLng, zoom: props.buildings.length === 1 ? 12 : 9 };
  }
  return CITY_CENTERS.Bangalore;
};

export const GoogleCityMap: React.FC<GoogleCityMapProps> = (props) => {
  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  const cityCenter = useMemo(() => getCityCenterForProps(props), [props]);

  if (!mapsApiKey) {
    return <MapFallbackView props={props} reason="missing-key" cityCenter={cityCenter} />;
  }

  return <LiveGoogleCityMap props={props} cityCenter={cityCenter} />;
};

const LiveGoogleCityMap: React.FC<{
  props: GoogleCityMapProps;
  cityCenter: { lat: number; lng: number; zoom: number };
}> = ({ props, cityCenter }) => {
  const apiStatus = useApiLoadingStatus();
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  if (
    apiStatus === APILoadingStatus.FAILED ||
    apiStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return <MapFallbackView props={props} reason="load-error" cityCenter={cityCenter} />;
  }

  const cityFlats =
    props.mode === 'city-zones'
      ? FLATS_DATABASE.filter((f) => f.city === props.city)
      : props.mode === 'flat-detail'
      ? FLATS_DATABASE.filter((f) => f.city === props.flat.city)
      : [];

  const selectedFlatInfo =
    selectedMarkerId && selectedMarkerId.startsWith('flat:')
      ? cityFlats.find((f) => `flat:${f.id}` === selectedMarkerId) || null
      : null;

  const selectedBuildingInfo =
    props.mode === 'company-projects' && selectedMarkerId?.startsWith('bld:')
      ? props.buildings.find((b) => `bld:${b.id}` === selectedMarkerId) || null
      : null;

  return (
    <div
      className={`w-full ${
        props.heightClass || 'h-[380px] sm:h-[420px]'
      } rounded-2xl overflow-hidden border border-[#D0DDD7] bg-[#E9EFEA] relative shadow-sm`}
    >
      <GoogleMap
        key={`${props.mode}-${props.mode === 'city-zones' ? `${props.city}-${props.selectedZone || 'all'}` : props.mode === 'flat-detail' ? props.flat.id : props.selectedCompany}`}
        defaultCenter={{ lat: cityCenter.lat, lng: cityCenter.lng }}
        defaultZoom={cityCenter.zoom}
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        gestureHandling="cooperative"
        streetViewControl={false}
        mapTypeControl={false}
        className="w-full h-full"
      >
        {/* MODE 1: CITY & ZONES EXPLORER */}
        {props.mode === 'city-zones' && (
          <>
            {(['North', 'South', 'East', 'West'] as const).map((zoneName) => {
              const z = ZONE_CENTERS[props.city][zoneName];
              const isSelected = props.selectedZone === zoneName;
              return (
                <React.Fragment key={zoneName}>
                  <Circle
                    center={{ lat: z.lat, lng: z.lng }}
                    radius={isSelected ? 5200 : 3400}
                    strokeColor={isSelected ? '#0F4C5C' : '#4B5E63'}
                    strokeOpacity={isSelected ? 0.85 : 0.45}
                    strokeWeight={isSelected ? 2.5 : 1}
                    fillColor={isSelected ? '#0F4C5C' : '#8FA3A8'}
                    fillOpacity={isSelected ? 0.18 : 0.08}
                  />
                  <AdvancedMarker
                    position={{ lat: z.lat, lng: z.lng }}
                    title={`${zoneName} ${props.city}: ${z.label}`}
                    onClick={() => {
                      props.onSelectZone(zoneName);
                      setSelectedMarkerId(`zone:${zoneName}`);
                    }}
                  >
                    <div
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-['Red_Hat_Mono'] shadow-md border transition-transform cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#0F4C5C] text-white border-white scale-110'
                          : 'bg-white/95 text-[#152226] border-[#0F4C5C]/40 hover:scale-105'
                      }`}
                    >
                      <Compass className="w-3 h-3" />
                      <span>{zoneName}</span>
                    </div>
                  </AdvancedMarker>
                </React.Fragment>
              );
            })}

            {cityFlats.map((f) => {
              const inZone = !props.selectedZone || props.selectedZone === 'Advice' || f.zone === props.selectedZone;
              return (
                <AdvancedMarker
                  key={f.id}
                  position={{ lat: f.lat, lng: f.lng }}
                  title={`${f.name} (${f.price})`}
                  onClick={() => setSelectedMarkerId(`flat:${f.id}`)}
                >
                  <Pin
                    background={inZone ? '#B44D27' : '#8FA3A8'}
                    borderColor={inZone ? '#5C220D' : '#4B5E63'}
                    glyphColor="#FFFFFF"
                    scale={inZone ? 1.05 : 0.85}
                  />
                </AdvancedMarker>
              );
            })}

            {selectedFlatInfo && (
              <InfoWindow
                position={{ lat: selectedFlatInfo.lat, lng: selectedFlatInfo.lng }}
                onCloseClick={() => setSelectedMarkerId(null)}
              >
                <div className="p-1 max-w-[230px] text-[#152226] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-['Red_Hat_Mono'] font-bold uppercase text-[#0F4C5C]">
                      {selectedFlatInfo.zone} Zone • ★ {selectedFlatInfo.score}
                    </span>
                    <span className="text-[10px] font-['Red_Hat_Mono'] font-bold text-[#1F7A4C]">
                      {selectedFlatInfo.carpet}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#152226] leading-snug">
                    {selectedFlatInfo.name}
                  </h4>
                  <p className="text-[11px] text-[#4B5E63]">{selectedFlatInfo.locality}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#D0DDD7]">
                    <span className="font-['Red_Hat_Mono'] text-xs font-bold text-[#0F4C5C]">
                      {selectedFlatInfo.price}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => props.onSelectZone(selectedFlatInfo.zone)}
                        className="px-2 py-0.5 rounded bg-[#E9EFEA] text-[#0F4C5C] text-[10px] font-semibold cursor-pointer"
                      >
                        Pick {selectedFlatInfo.zone}
                      </button>
                      {props.onInspectFlat && (
                        <button
                          type="button"
                          onClick={() => props.onInspectFlat?.(selectedFlatInfo.id)}
                          className="px-2 py-0.5 rounded bg-[#0F4C5C] text-white text-[10px] font-semibold cursor-pointer"
                        >
                          Inspect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </>
        )}

        {/* MODE 2: COMPANY BUILDING PROJECTS GIS MAP */}
        {props.mode === 'company-projects' && (
          <>
            {props.buildings.map((b) => {
              const colors = STAGE_PIN_COLORS[b.stage] || STAGE_PIN_COLORS['Under Construction'];
              return (
                <AdvancedMarker
                  key={b.id}
                  position={{ lat: b.lat, lng: b.lng }}
                  title={`${b.name} — ${b.stage}`}
                  onClick={() => setSelectedMarkerId(`bld:${b.id}`)}
                >
                  <Pin
                    background={colors.bg}
                    borderColor={colors.border}
                    glyphColor={colors.glyph}
                    scale={1.1}
                  />
                </AdvancedMarker>
              );
            })}

            {selectedBuildingInfo && (
              <InfoWindow
                position={{ lat: selectedBuildingInfo.lat, lng: selectedBuildingInfo.lng }}
                onCloseClick={() => setSelectedMarkerId(null)}
              >
                <div className="p-1 max-w-[240px] text-[#152226] flex flex-col gap-1.5">
                  <span className="text-[10px] font-['Red_Hat_Mono'] font-bold uppercase text-[#B44D27]">
                    {selectedBuildingInfo.stage}
                  </span>
                  <h4 className="font-bold text-xs text-[#152226]">
                    {selectedBuildingInfo.name}
                  </h4>
                  <p className="text-[11px] text-[#4B5E63] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#B44D27] shrink-0" />
                    <span>{selectedBuildingInfo.place}</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-['Red_Hat_Mono'] pt-1 border-t border-[#D0DDD7]">
                    <span className="flex items-center gap-1 text-[#0F4C5C] font-bold">
                      <Users className="w-3 h-3" />
                      {selectedBuildingInfo.leadCount} Leads ({selectedBuildingInfo.avgConversion}%)
                    </span>
                    <button
                      type="button"
                      onClick={() => props.onSelectBuilding(selectedBuildingInfo)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#B44D27] text-white text-[10px] font-semibold cursor-pointer"
                    >
                      <span>Open Leads</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </>
        )}

        {/* MODE 3: FLAT DETAIL & 2KM MICRO-MARKET RADIUS */}
        {props.mode === 'flat-detail' && (
          <>
            <Circle
              center={{ lat: props.flat.lat, lng: props.flat.lng }}
              radius={2000}
              strokeColor="#0F4C5C"
              strokeOpacity={0.75}
              strokeWeight={2}
              fillColor="#0F4C5C"
              fillOpacity={0.12}
            />

            {cityFlats.map((f) => {
              const isCurrent = f.id === props.flat.id;
              return (
                <AdvancedMarker
                  key={f.id}
                  position={{ lat: f.lat, lng: f.lng }}
                  title={`${f.name} — ${f.price}`}
                  onClick={() => setSelectedMarkerId(`flat:${f.id}`)}
                >
                  <Pin
                    background={isCurrent ? '#B44D27' : '#0F4C5C'}
                    borderColor={isCurrent ? '#5C220D' : '#09323D'}
                    glyphColor="#FFFFFF"
                    scale={isCurrent ? 1.25 : 0.9}
                  />
                </AdvancedMarker>
              );
            })}

            {selectedFlatInfo && (
              <InfoWindow
                position={{ lat: selectedFlatInfo.lat, lng: selectedFlatInfo.lng }}
                onCloseClick={() => setSelectedMarkerId(null)}
              >
                <div className="p-1 max-w-[230px] text-[#152226] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-['Red_Hat_Mono']">
                    <span className="font-bold text-[#0F4C5C]">
                      {selectedFlatInfo.id === props.flat.id ? 'Selected Property' : 'Comparable Property'}
                    </span>
                    <span className="font-bold text-[#1F7A4C] flex items-center gap-0.5">
                      <Layers className="w-3 h-3" /> {selectedFlatInfo.carpet}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#152226]">{selectedFlatInfo.name}</h4>
                  <p className="text-[11px] text-[#4B5E63]">{selectedFlatInfo.rate}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#D0DDD7]">
                    <span className="font-['Red_Hat_Mono'] text-xs font-bold text-[#0F4C5C]">
                      {selectedFlatInfo.price}
                    </span>
                    {selectedFlatInfo.id !== props.flat.id && props.onSelectComparable && (
                      <button
                        type="button"
                        onClick={() => props.onSelectComparable?.(selectedFlatInfo.id)}
                        className="px-2 py-0.5 rounded bg-[#0F4C5C] text-white text-[10px] font-semibold cursor-pointer"
                      >
                        Compare
                      </button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </>
        )}
      </GoogleMap>

      {/* Bottom Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs border border-[#D0DDD7] shadow-sm text-[11px] font-medium text-[#152226] flex flex-wrap items-center gap-3 pointer-events-none">
        {props.mode === 'city-zones' && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C5C]" />
              Zone Radius
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B44D27]" />
              Matching Inventory ({cityFlats.length})
            </span>
          </>
        )}
        {props.mode === 'company-projects' && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A4C]" />
              Already Present
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C5C]" />
              Under Construction
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B44D27]" />
              About to Start
            </span>
          </>
        )}
        {props.mode === 'flat-detail' && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B44D27]" />
              {props.flat.name} (2km Micro-Market)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C5C]" />
              Nearby Audited Comparables
            </span>
          </>
        )}
      </div>
    </div>
  );
};
