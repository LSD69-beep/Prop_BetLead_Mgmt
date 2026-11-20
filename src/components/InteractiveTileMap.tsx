import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BuildingLocation, City, DirectionZone, Flat } from '../types';
import { FLATS_DATABASE } from '../data/mockData';

interface CityZonesTileProps {
  mode: 'city-zones';
  city: City;
  selectedZone: DirectionZone | null;
  onSelectZone: (zone: DirectionZone) => void;
  onInspectFlat?: (flatId: string) => void;
  heightClass?: string;
}

interface CompanyProjectsTileProps {
  mode: 'company-projects';
  buildings: BuildingLocation[];
  selectedCompany: string;
  onSelectBuilding: (building: BuildingLocation) => void;
  heightClass?: string;
}

interface FlatDetailTileProps {
  mode: 'flat-detail';
  flat: Flat;
  onSelectComparable?: (flatId: string) => void;
  heightClass?: string;
}

export type InteractiveTileMapProps =
  | CityZonesTileProps
  | CompanyProjectsTileProps
  | FlatDetailTileProps;

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

const STAGE_PIN_COLORS: Record<string, { bg: string; border: string }> = {
  'Already Present': { bg: '#1F7A4C', border: '#14532D' },
  'Under Construction': { bg: '#0F4C5C', border: '#09323D' },
  'About to Start': { bg: '#B44D27', border: '#5C220D' },
};

const createTeardropPinIcon = (bg: string, border: string, scale = 1): L.DivIcon => {
  const width = Math.round(28 * scale);
  const height = Math.round(36 * scale);
  return L.divIcon({
    className: '',
    iconSize: [width, height],
    iconAnchor: [Math.round(width / 2), height],
    popupAnchor: [0, -height + 4],
    html: `<svg width="${width}" height="${height}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.28)); cursor: pointer;">
      <path d="M14 1.5C7.1 1.5 1.5 7.1 1.5 14C1.5 23.2 14 34.5 14 34.5C14 34.5 26.5 23.2 26.5 14C26.5 7.1 20.9 1.5 14 1.5Z" fill="${bg}" stroke="${border}" stroke-width="2"/>
      <circle cx="14" cy="13.5" r="4.5" fill="#FFFFFF"/>
    </svg>`,
  });
};

const createZonePillIcon = (zoneName: string, isSelected: boolean): L.DivIcon => {
  const bg = isSelected ? '#0F4C5C' : 'rgba(255,255,255,0.96)';
  const color = isSelected ? '#FFFFFF' : '#152226';
  const border = isSelected ? '#FFFFFF' : 'rgba(15,76,92,0.45)';
  const scale = isSelected ? 'transform: scale(1.08);' : '';
  return L.divIcon({
    className: '',
    iconSize: [78, 28],
    iconAnchor: [39, 14],
    html: `<div style="display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:4px 10px;border-radius:9999px;background:${bg};color:${color};border:1.5px solid ${border};font-family:'Red Hat Mono',monospace;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.18);cursor:pointer;white-space:nowrap;${scale}">
      <span>⌖</span><span>${zoneName}</span>
    </div>`,
  });
};

const buildFlatPopupEl = (
  flat: Flat,
  options: {
    mode: 'city-zones' | 'flat-detail';
    isCurrent?: boolean;
    onPickZone?: (zone: DirectionZone) => void;
    onInspect?: (flatId: string) => void;
    onCompare?: (flatId: string) => void;
  }
): HTMLElement => {
  const root = document.createElement('div');
  root.style.cssText = 'min-width:205px;max-width:235px;font-family:Inter,sans-serif;color:#152226;';

  const topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;';

  const badge = document.createElement('span');
  badge.style.cssText = "font-family:'Red Hat Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;color:#0F4C5C;";
  badge.textContent =
    options.mode === 'flat-detail'
      ? options.isCurrent
        ? 'Selected Property'
        : 'Comparable Property'
      : `${flat.zone} Zone • ★ ${flat.score}`;

  const carpet = document.createElement('span');
  carpet.style.cssText = "font-family:'Red Hat Mono',monospace;font-size:10px;font-weight:700;color:#1F7A4C;";
  carpet.textContent = flat.carpet;

  topRow.appendChild(badge);
  topRow.appendChild(carpet);
  root.appendChild(topRow);

  const title = document.createElement('h4');
  title.style.cssText = 'font-size:12.5px;font-weight:700;margin:0 0 2px 0;color:#152226;line-height:1.3;';
  title.textContent = flat.name;
  root.appendChild(title);

  const sub = document.createElement('p');
  sub.style.cssText = 'font-size:11px;color:#4B5E63;margin:0 0 8px 0;';
  sub.textContent = options.mode === 'flat-detail' ? flat.rate : flat.locality;
  root.appendChild(sub);

  const footer = document.createElement('div');
  footer.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid #D0DDD7;';

  const price = document.createElement('span');
  price.style.cssText = "font-family:'Red Hat Mono',monospace;font-size:12px;font-weight:700;color:#0F4C5C;";
  price.textContent = flat.price;
  footer.appendChild(price);

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;align-items:center;gap:6px;';

  if (options.mode === 'city-zones') {
    if (options.onPickZone) {
      const pickBtn = document.createElement('button');
      pickBtn.type = 'button';
      pickBtn.textContent = `Pick ${flat.zone}`;
      pickBtn.style.cssText = 'padding:3px 8px;border-radius:6px;border:none;background:#E9EFEA;color:#0F4C5C;font-size:10px;font-weight:600;cursor:pointer;';
      pickBtn.addEventListener('click', () => options.onPickZone?.(flat.zone));
      actions.appendChild(pickBtn);
    }
    if (options.onInspect) {
      const inspectBtn = document.createElement('button');
      inspectBtn.type = 'button';
      inspectBtn.textContent = 'Inspect';
      inspectBtn.style.cssText = 'padding:3px 8px;border-radius:6px;border:none;background:#0F4C5C;color:#FFFFFF;font-size:10px;font-weight:600;cursor:pointer;';
      inspectBtn.addEventListener('click', () => options.onInspect?.(flat.id));
      actions.appendChild(inspectBtn);
    }
  } else if (!options.isCurrent && options.onCompare) {
    const compareBtn = document.createElement('button');
    compareBtn.type = 'button';
    compareBtn.textContent = 'Compare';
    compareBtn.style.cssText = 'padding:3px 8px;border-radius:6px;border:none;background:#0F4C5C;color:#FFFFFF;font-size:10px;font-weight:600;cursor:pointer;';
    compareBtn.addEventListener('click', () => options.onCompare?.(flat.id));
    actions.appendChild(compareBtn);
  }

  footer.appendChild(actions);
  root.appendChild(footer);
  return root;
};

const buildBuildingPopupEl = (
  b: BuildingLocation,
  onSelectBuilding: (building: BuildingLocation) => void
): HTMLElement => {
  const root = document.createElement('div');
  root.style.cssText = 'min-width:210px;max-width:240px;font-family:Inter,sans-serif;color:#152226;';

  const stage = document.createElement('div');
  stage.style.cssText = "font-family:'Red Hat Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;color:#B44D27;margin-bottom:4px;";
  stage.textContent = b.stage;
  root.appendChild(stage);

  const name = document.createElement('h4');
  name.style.cssText = 'font-size:12.5px;font-weight:700;margin:0 0 2px 0;color:#152226;';
  name.textContent = b.name;
  root.appendChild(name);

  const place = document.createElement('p');
  place.style.cssText = 'font-size:11px;color:#4B5E63;margin:0 0 8px 0;';
  place.textContent = b.place;
  root.appendChild(place);

  const footer = document.createElement('div');
  footer.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid #D0DDD7;';

  const leads = document.createElement('span');
  leads.style.cssText = "font-family:'Red Hat Mono',monospace;font-size:11px;font-weight:700;color:#0F4C5C;";
  leads.textContent = `${b.leadCount} Leads (${b.avgConversion}%)`;
  footer.appendChild(leads);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Open Leads →';
  btn.style.cssText = 'padding:4px 8px;border-radius:6px;border:none;background:#B44D27;color:#FFFFFF;font-size:10px;font-weight:600;cursor:pointer;';
  btn.addEventListener('click', () => onSelectBuilding(b));
  footer.appendChild(btn);

  root.appendChild(footer);
  return root;
};

export const InteractiveTileMap: React.FC<InteractiveTileMapProps> = (props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const cityFlatsCount =
    props.mode === 'city-zones'
      ? FLATS_DATABASE.filter((f) => f.city === props.city).length
      : 0;

  // Initialize Leaflet map once and update layers reactively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: [CITY_CENTERS.Bangalore.lat, CITY_CENTERS.Bangalore.lng],
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render markers, circles, and viewport whenever props change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const overlayGroup = L.layerGroup().addTo(map);

    if (props.mode === 'city-zones') {
      const center =
        props.selectedZone && props.selectedZone !== 'Advice'
          ? { ...ZONE_CENTERS[props.city][props.selectedZone], zoom: 12 }
          : CITY_CENTERS[props.city];

      map.setView([center.lat, center.lng], center.zoom, { animate: true });

      (['North', 'South', 'East', 'West'] as const).forEach((zoneName) => {
        const z = ZONE_CENTERS[props.city][zoneName];
        const isSelected = props.selectedZone === zoneName;

        L.circle([z.lat, z.lng], {
          radius: isSelected ? 5200 : 3400,
          color: isSelected ? '#0F4C5C' : '#4B5E63',
          opacity: isSelected ? 0.85 : 0.45,
          weight: isSelected ? 2.5 : 1,
          fillColor: isSelected ? '#0F4C5C' : '#8FA3A8',
          fillOpacity: isSelected ? 0.18 : 0.08,
        })
          .on('click', () => {
            if (propsRef.current.mode === 'city-zones') {
              propsRef.current.onSelectZone(zoneName);
            }
          })
          .addTo(overlayGroup);

        L.marker([z.lat, z.lng], {
          icon: createZonePillIcon(zoneName, isSelected),
          title: `${zoneName} ${props.city}: ${z.label}`,
          zIndexOffset: isSelected ? 500 : 200,
        })
          .on('click', () => {
            if (propsRef.current.mode === 'city-zones') {
              propsRef.current.onSelectZone(zoneName);
            }
          })
          .addTo(overlayGroup);
      });

      const cityFlats = FLATS_DATABASE.filter((f) => f.city === props.city);
      cityFlats.forEach((f) => {
        const inZone =
          !props.selectedZone || props.selectedZone === 'Advice' || f.zone === props.selectedZone;
        const icon = createTeardropPinIcon(
          inZone ? '#B44D27' : '#8FA3A8',
          inZone ? '#5C220D' : '#4B5E63',
          inZone ? 1 : 0.82
        );

        const popupEl = buildFlatPopupEl(f, {
          mode: 'city-zones',
          onPickZone: (zone) => {
            if (propsRef.current.mode === 'city-zones') {
              propsRef.current.onSelectZone(zone);
            }
          },
          onInspect: (flatId) => {
            if (propsRef.current.mode === 'city-zones') {
              propsRef.current.onInspectFlat?.(flatId);
            }
          },
        });

        L.marker([f.lat, f.lng], {
          icon,
          title: `${f.name} (${f.price})`,
          zIndexOffset: inZone ? 300 : 100,
        })
          .bindPopup(popupEl)
          .addTo(overlayGroup);
      });
    } else if (props.mode === 'company-projects') {
      if (props.buildings.length > 0) {
        if (props.buildings.length === 1) {
          map.setView([props.buildings[0].lat, props.buildings[0].lng], 12, { animate: true });
        } else {
          const bounds = L.latLngBounds(props.buildings.map((b) => [b.lat, b.lng]));
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
        }
      } else {
        map.setView([CITY_CENTERS.Bangalore.lat, CITY_CENTERS.Bangalore.lng], 9);
      }

      props.buildings.forEach((b) => {
        const colors = STAGE_PIN_COLORS[b.stage] || STAGE_PIN_COLORS['Under Construction'];
        const icon = createTeardropPinIcon(colors.bg, colors.border, 1.05);
        const popupEl = buildBuildingPopupEl(b, (building) => {
          if (propsRef.current.mode === 'company-projects') {
            propsRef.current.onSelectBuilding(building);
          }
        });

        L.marker([b.lat, b.lng], {
          icon,
          title: `${b.name} — ${b.stage}`,
        })
          .bindPopup(popupEl)
          .addTo(overlayGroup);
      });
    } else if (props.mode === 'flat-detail') {
      map.setView([props.flat.lat, props.flat.lng], 13, { animate: true });

      L.circle([props.flat.lat, props.flat.lng], {
        radius: 2000,
        color: '#0F4C5C',
        opacity: 0.75,
        weight: 2,
        fillColor: '#0F4C5C',
        fillOpacity: 0.12,
      }).addTo(overlayGroup);

      const cityFlats = FLATS_DATABASE.filter((f) => f.city === props.flat.city);
      cityFlats.forEach((f) => {
        const isCurrent = f.id === props.flat.id;
        const icon = createTeardropPinIcon(
          isCurrent ? '#B44D27' : '#0F4C5C',
          isCurrent ? '#5C220D' : '#09323D',
          isCurrent ? 1.18 : 0.88
        );

        const popupEl = buildFlatPopupEl(f, {
          mode: 'flat-detail',
          isCurrent,
          onCompare: (flatId) => {
            if (propsRef.current.mode === 'flat-detail') {
              propsRef.current.onSelectComparable?.(flatId);
            }
          },
        });

        L.marker([f.lat, f.lng], {
          icon,
          title: `${f.name} — ${f.price}`,
          zIndexOffset: isCurrent ? 500 : 200,
        })
          .bindPopup(popupEl)
          .addTo(overlayGroup);
      });
    }

    // Ensure proper size calculation inside dynamic grid layouts
    setTimeout(() => {
      map.invalidateSize();
    }, 50);

    return () => {
      overlayGroup.remove();
    };
  }, [props]);

  return (
    <div
      className={`w-full ${
        props.heightClass || 'h-[380px] sm:h-[420px]'
      } rounded-2xl overflow-hidden border border-[#D0DDD7] bg-[#E9EFEA] relative shadow-sm`}
    >
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Bottom Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-xs border border-[#D0DDD7] shadow-sm text-[11px] font-medium text-[#152226] flex flex-wrap items-center gap-3 pointer-events-none">
        {props.mode === 'city-zones' && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C5C]" />
              Zone Radius
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B44D27]" />
              Matching Inventory ({cityFlatsCount})
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
