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
import { InteractiveTileMap } from './InteractiveTileMap';
import { MapPin, Compass, Layers, Users, ArrowRight } from 'lucide-react';

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
    return <InteractiveTileMap {...props} />;
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
    return <InteractiveTileMap {...props} />;
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
