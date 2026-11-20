import React, { useState } from 'react';
import { City, DirectionZone } from '../types';
import { MapPin, Navigation, Layers, Compass, Building, Info } from 'lucide-react';

interface ActualCityMapProps {
  city: City;
  selectedZone: DirectionZone | null;
  onSelectZone: (zone: DirectionZone) => void;
}

export const ActualCityMap: React.FC<ActualCityMapProps> = ({
  city,
  selectedZone,
  onSelectZone,
}) => {
  const [hoveredZone, setHoveredZone] = useState<DirectionZone | null>(null);
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'transit' | 'hubs'>('all');

  // Zone colors & highlights
  const getZoneFill = (zone: DirectionZone) => {
    if (selectedZone === zone) return '#D2E8ED';
    if (hoveredZone === zone) return '#E9F3F5';
    return '#FFFFFF';
  };

  const getZoneStroke = (zone: DirectionZone) => {
    if (selectedZone === zone) return '#0F4C5C';
    if (hoveredZone === zone) return '#278AA1';
    return '#CBD5E1';
  };

  const getZoneStrokeWidth = (zone: DirectionZone) => {
    if (selectedZone === zone) return '2.5';
    if (hoveredZone === zone) return '2';
    return '1.2';
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Top Map Header & Layer Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C5C] animate-pulse" />
          <span className="text-xs font-bold text-[#152226] uppercase tracking-wider font-['Red_Hat_Mono']">
            {city} Cartographic Mastermap
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white border border-[#D0DDD7] p-1 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`px-2 py-0.5 rounded cursor-pointer font-medium transition-colors ${
              activeLayer === 'all' ? 'bg-[#0F4C5C] text-white' : 'text-[#4B5E63] hover:text-[#152226]'
            }`}
          >
            All Corridors
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('transit')}
            className={`px-2 py-0.5 rounded cursor-pointer font-medium transition-colors ${
              activeLayer === 'transit' ? 'bg-[#0F4C5C] text-white' : 'text-[#4B5E63] hover:text-[#152226]'
            }`}
          >
            Metro &amp; ORR
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('hubs')}
            className={`px-2 py-0.5 rounded cursor-pointer font-medium transition-colors ${
              activeLayer === 'hubs' ? 'bg-[#0F4C5C] text-white' : 'text-[#4B5E63] hover:text-[#152226]'
            }`}
          >
            Tech Hubs
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="w-full max-w-md aspect-square bg-[#F8FAF9] rounded-2xl border border-[#D0DDD7] p-2 relative shadow-xs overflow-hidden">
        {city === 'Bangalore' && (
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full select-none"
            role="img"
            aria-label="Actual geographic map of Bangalore"
          >
            <defs>
              <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#7DD3FC" />
              </linearGradient>
            </defs>

            {/* Background grid */}
            <rect width="500" height="500" fill="url(#grid-pattern)" />

            {/* Interactive Zone Quadrants (Geographic outlines) */}
            {/* NORTH BANGALORE (Hebbal, Yelahanka, Manyata, Devanahalli) */}
            <path
              d="M 170 210 L 250 170 L 330 210 L 370 120 L 300 40 L 200 40 L 130 120 Z"
              fill={getZoneFill('North')}
              stroke={getZoneStroke('North')}
              strokeWidth={getZoneStrokeWidth('North')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('North')}
              onMouseEnter={() => setHoveredZone('North')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* EAST BANGALORE (Whitefield, ITPL, Marathahalli, Bellandur, Sarjapur) */}
            <path
              d="M 250 250 L 330 210 L 460 210 L 460 330 L 360 340 L 290 280 Z"
              fill={getZoneFill('East')}
              stroke={getZoneStroke('East')}
              strokeWidth={getZoneStrokeWidth('East')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('East')}
              onMouseEnter={() => setHoveredZone('East')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* SOUTH BANGALORE (Koramangala, HSR, Electronic City, Kanakapura) */}
            <path
              d="M 250 250 L 290 280 L 360 340 L 330 460 L 170 460 L 180 320 Z"
              fill={getZoneFill('South')}
              stroke={getZoneStroke('South')}
              strokeWidth={getZoneStrokeWidth('South')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('South')}
              onMouseEnter={() => setHoveredZone('South')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* WEST BANGALORE (Malleshwaram, Rajajinagar, Yeshwanthpur, Mysore Rd) */}
            <path
              d="M 250 250 L 170 210 L 130 120 L 40 210 L 60 350 L 180 320 Z"
              fill={getZoneFill('West')}
              stroke={getZoneStroke('West')}
              strokeWidth={getZoneStrokeWidth('West')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('West')}
              onMouseEnter={() => setHoveredZone('West')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* Real Lakes & Reservoirs */}
            {/* Bellandur Lake (Large East lake) */}
            <path
              d="M 335 275 C 345 265, 370 270, 365 285 C 360 295, 340 300, 330 290 Z"
              fill="url(#waterGrad)"
              stroke="#0284C7"
              strokeWidth="0.8"
            />
            <text x="350" y="282" fontSize="7" fill="#0369A1" fontWeight="600">Bellandur Lake</text>

            {/* Varthur Lake (Far East) */}
            <path
              d="M 405 285 C 415 280, 435 290, 425 305 C 415 315, 395 305, 405 285 Z"
              fill="url(#waterGrad)"
              stroke="#0284C7"
              strokeWidth="0.8"
            />

            {/* Hebbal Lake (North) */}
            <path
              d="M 225 140 C 240 135, 255 145, 250 155 C 240 160, 220 155, 225 140 Z"
              fill="url(#waterGrad)"
              stroke="#0284C7"
              strokeWidth="0.8"
            />
            <text x="240" y="152" fontSize="7" fill="#0369A1" fontWeight="600">Hebbal Lake</text>

            {/* Ulsoor Lake (Central East) */}
            <path
              d="M 275 220 C 285 218, 292 225, 288 232 C 282 236, 272 232, 275 220 Z"
              fill="url(#waterGrad)"
              stroke="#0284C7"
              strokeWidth="0.8"
            />
            <text x="285" y="228" fontSize="6.5" fill="#0369A1" fontWeight="600">Ulsoor</text>

            {/* Sankey Tank (North West) */}
            <circle cx="190" cy="180" r="7" fill="url(#waterGrad)" stroke="#0284C7" strokeWidth="0.8" />

            {/* Arterial Highways & Expressways */}
            {/* Outer Ring Road (ORR) - Main circular bypass loop */}
            <path
              d="M 150 140 C 200 110, 300 115, 360 180 C 390 220, 390 310, 350 350 C 310 390, 190 380, 140 330 C 90 270, 95 180, 150 140 Z"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3.2"
              strokeDasharray="none"
              opacity="0.85"
            />

            {/* Bellary Road / Airport Highway NH 44 (Northward) */}
            <path d="M 250 250 L 250 30" fill="none" stroke="#EF4444" strokeWidth="2.5" />

            {/* Electronic City Elevated Expressway (Southward) */}
            <path d="M 250 250 L 290 470" fill="none" stroke="#EF4444" strokeWidth="2.5" />

            {/* Old Airport Rd to Whitefield (Eastward) */}
            <path d="M 250 250 L 440 240" fill="none" stroke="#EF4444" strokeWidth="2" />

            {/* Namma Metro Purple Line (Purple) */}
            {(activeLayer === 'all' || activeLayer === 'transit') && (
              <path
                d="M 90 260 L 190 250 L 250 245 L 300 240 L 430 235"
                fill="none"
                stroke="#9333EA"
                strokeWidth="2.2"
                strokeDasharray="4 2"
              />
            )}

            {/* Namma Metro Green Line (Green) */}
            {(activeLayer === 'all' || activeLayer === 'transit') && (
              <path
                d="M 160 130 L 200 190 L 250 250 L 240 350 L 230 430"
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.2"
                strokeDasharray="4 2"
              />
            )}

            {/* Central Business District (CBD) Core */}
            <circle cx="250" cy="245" r="22" fill="#0F4C5C" fillOpacity="0.12" stroke="#0F4C5C" strokeWidth="1.5" />
            <circle cx="250" cy="245" r="4.5" fill="#0F4C5C" />
            <text x="250" y="235" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0F4C5C">
              MG Road / CBD
            </text>

            {/* Key Micro-market Landmark Pins */}
            {/* North */}
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('North')}
              onMouseEnter={() => setHoveredLandmark('Hebbal Flyover & Manyata SEZ')}
              onMouseLeave={() => setHoveredLandmark(null)}
            >
              <circle cx="250" cy="120" r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              <text x="250" y="110" textAnchor="middle" fontSize="8" fontWeight="700" fill="#152226">
                Hebbal / Manyata
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('North')}
            >
              <circle cx="230" cy="70" r="4" fill="#64748B" stroke="#FFF" strokeWidth="1" />
              <text x="230" y="62" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#475569">
                Yelahanka
              </text>
            </g>
            {/* Airport Vector North-East */}
            <text x="320" y="45" fontSize="8" fontWeight="700" fill="#0F4C5C">✈ KIA Airport</text>

            {/* East */}
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('East')}
              onMouseEnter={() => setHoveredLandmark('Whitefield ITPL & Prestige Tech Park')}
              onMouseLeave={() => setHoveredLandmark(null)}
            >
              <circle cx="410" cy="235" r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              <text x="410" y="225" textAnchor="middle" fontSize="8" fontWeight="700" fill="#152226">
                Whitefield ITPL
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('East')}
            >
              <circle cx="340" cy="240" r="4.5" fill="#0F4C5C" stroke="#FFF" strokeWidth="1" />
              <text x="340" y="232" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#152226">
                Marathahalli
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('East')}
            >
              <circle cx="350" cy="310" r="4.5" fill="#B44D27" stroke="#FFF" strokeWidth="1" />
              <text x="350" y="322" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#152226">
                Sarjapur Rd
              </text>
            </g>

            {/* South */}
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('South')}
              onMouseEnter={() => setHoveredLandmark('Koramangala 100ft & Startup Hub')}
              onMouseLeave={() => setHoveredLandmark(null)}
            >
              <circle cx="280" cy="290" r="4.5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              <text x="280" y="282" textAnchor="middle" fontSize="8" fontWeight="700" fill="#152226">
                Koramangala
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('South')}
            >
              <circle cx="295" cy="330" r="4" fill="#0F4C5C" stroke="#FFF" strokeWidth="1" />
              <text x="295" y="322" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#152226">
                HSR Layout
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('South')}
            >
              <circle cx="300" cy="420" r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              <text x="300" y="435" textAnchor="middle" fontSize="8" fontWeight="700" fill="#152226">
                Electronic City
              </text>
            </g>

            {/* West */}
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('West')}
              onMouseEnter={() => setHoveredLandmark('Malleshwaram & World Trade Center')}
              onMouseLeave={() => setHoveredLandmark(null)}
            >
              <circle cx="180" cy="205" r="4.5" fill="#0F4C5C" stroke="#FFF" strokeWidth="1" />
              <text x="180" y="196" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#152226">
                Malleshwaram
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('West')}
            >
              <circle cx="150" cy="240" r="4" fill="#64748B" stroke="#FFF" strokeWidth="1" />
              <text x="150" y="232" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#152226">
                Rajajinagar
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('West')}
            >
              <circle cx="140" cy="170" r="4.5" fill="#EF4444" stroke="#FFF" strokeWidth="1" />
              <text x="140" y="162" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#152226">
                Yeshwanthpur
              </text>
            </g>
          </svg>
        )}

        {city === 'Hyderabad' && (
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full select-none"
            role="img"
            aria-label="Actual geographic map of Hyderabad"
          >
            <defs>
              <linearGradient id="hydWater" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Nehru Outer Ring Road (ORR) - Complete 8-Lane Loop */}
            <ellipse
              cx="250"
              cy="255"
              rx="205"
              ry="190"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3.4"
              opacity="0.85"
            />

            {/* Musi River (Flowing West to East) */}
            <path
              d="M 60 305 Q 150 280, 240 310 T 360 295 T 450 315"
              fill="none"
              stroke="#0284C7"
              strokeWidth="3"
              opacity="0.7"
            />
            <text x="410" y="310" fontSize="7" fill="#0369A1" fontWeight="600">Musi River</text>

            {/* Hussain Sagar Lake (Heart-shaped center landmark with Buddha Island) */}
            <path
              d="M 285 205 C 295 185, 320 190, 318 215 C 315 235, 290 245, 285 240 C 280 245, 255 235, 252 215 C 250 190, 275 185, 285 205 Z"
              fill="url(#hydWater)"
              stroke="#0284C7"
              strokeWidth="1.2"
            />
            {/* Buddha Statue in lake center */}
            <circle cx="285" cy="216" r="3" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
            <text x="285" y="200" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0369A1">
              Hussain Sagar
            </text>

            {/* Osman Sagar (Gandipet) in West */}
            <path
              d="M 90 280 C 110 270, 130 285, 120 305 C 110 320, 85 305, 90 280 Z"
              fill="url(#hydWater)"
              stroke="#0284C7"
              strokeWidth="1"
            />
            <text x="105" y="275" fontSize="7" fill="#0369A1" fontWeight="600">Gandipet</text>

            {/* Himayat Sagar in South-West */}
            <path
              d="M 125 360 C 145 350, 160 365, 150 385 C 135 400, 115 385, 125 360 Z"
              fill="url(#hydWater)"
              stroke="#0284C7"
              strokeWidth="1"
            />

            {/* Interactive Directional Zones */}
            {/* WEST HYDERABAD (The IT & Financial Epicenter: HITEC City, Gachibowli, Kokapet, Financial District) */}
            <path
              d="M 75 190 L 210 180 L 255 260 L 220 360 L 85 340 Z"
              fill={getZoneFill('West')}
              stroke={getZoneStroke('West')}
              strokeWidth={getZoneStrokeWidth('West')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('West')}
              onMouseEnter={() => setHoveredZone('West')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* NORTH HYDERABAD (Kompally, Medchal, Miyapur, Bachupally) */}
            <path
              d="M 160 90 L 330 90 L 330 180 L 220 180 Z"
              fill={getZoneFill('North')}
              stroke={getZoneStroke('North')}
              strokeWidth={getZoneStrokeWidth('North')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('North')}
              onMouseEnter={() => setHoveredZone('North')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* EAST HYDERABAD (Uppal, LB Nagar, Pocharam IT SEZ) */}
            <path
              d="M 330 190 L 440 200 L 435 340 L 320 330 L 320 230 Z"
              fill={getZoneFill('East')}
              stroke={getZoneStroke('East')}
              strokeWidth={getZoneStrokeWidth('East')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('East')}
              onMouseEnter={() => setHoveredZone('East')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* SOUTH HYDERABAD (Shamshabad, RGIA Airport, Rajendranagar, Airport Corridor) */}
            <path
              d="M 190 350 L 330 340 L 340 450 L 170 450 Z"
              fill={getZoneFill('South')}
              stroke={getZoneStroke('South')}
              strokeWidth={getZoneStrokeWidth('South')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('South')}
              onMouseEnter={() => setHoveredZone('South')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* Hyderabad Metro Network */}
            {(activeLayer === 'all' || activeLayer === 'transit') && (
              <>
                {/* Blue Line: Raidurg -> HITEC City -> Ameerpet -> Nagole */}
                <path
                  d="M 140 230 L 180 220 L 245 220 L 320 225 L 410 240"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                {/* Red Line: Miyapur -> Ameerpet -> LB Nagar */}
                <path
                  d="M 170 140 L 245 220 L 290 290 L 390 350"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              </>
            )}

            {/* PVNR Elevated Expressway (Airport link) */}
            <path d="M 260 270 L 235 430" fill="none" stroke="#EF4444" strokeWidth="2.4" />

            {/* Landmark Pins in West Corridor */}
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('West')}
              onMouseEnter={() => setHoveredLandmark('HITEC City Cyber Towers')}
              onMouseLeave={() => setHoveredLandmark(null)}
            >
              <circle cx="165" cy="225" r="5.5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              <text x="165" y="215" textAnchor="middle" fontSize="8" fontWeight="700" fill="#152226">
                HITEC City
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('West')}
            >
              <circle cx="145" cy="255" r="5" fill="#0F4C5C" stroke="#FFF" strokeWidth="1.5" />
              <text x="145" y="247" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#0F4C5C">
                Financial District
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('West')}
            >
              <circle cx="120" cy="275" r="5" fill="#B44D27" stroke="#FFF" strokeWidth="1.5" />
              <text x="120" y="267" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#B44D27">
                Kokapet Neopolis
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('West')}
            >
              <circle cx="180" cy="260" r="4.5" fill="#64748B" stroke="#FFF" strokeWidth="1" />
              <text x="180" y="252" textAnchor="middle" fontSize="7" fontWeight="600" fill="#152226">
                Gachibowli
              </text>
            </g>

            {/* Central Landmarks */}
            <circle cx="230" cy="235" r="4.5" fill="#64748B" stroke="#FFF" strokeWidth="1" />
            <text x="230" y="228" textAnchor="middle" fontSize="7" fontWeight="600" fill="#152226">
              Jubilee Hills
            </text>

            <circle cx="245" cy="255" r="4.5" fill="#64748B" stroke="#FFF" strokeWidth="1" />
            <text x="245" y="248" textAnchor="middle" fontSize="7" fontWeight="600" fill="#152226">
              Banjara Hills
            </text>

            {/* North */}
            <circle cx="250" cy="115" r="4.5" fill="#64748B" stroke="#FFF" strokeWidth="1" />
            <text x="250" y="105" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#152226">
              Kompally / Medchal
            </text>

            {/* South: RGIA Airport */}
            <circle cx="250" cy="430" r="5.5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
            <text x="250" y="445" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0F4C5C">
              ✈ RGIA Shamshabad
            </text>

            {/* East */}
            <circle cx="390" cy="245" r="4.5" fill="#64748B" stroke="#FFF" strokeWidth="1" />
            <text x="390" y="238" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#152226">
              Uppal IT SEZ
            </text>
          </svg>
        )}

        {city === 'Delhi' && (
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full select-none"
            role="img"
            aria-label="Actual geographic map of Delhi NCR"
          >
            <defs>
              <linearGradient id="yamunaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>

            {/* Yamuna River flowing North to South-East */}
            <path
              d="M 310 30 Q 295 120, 310 180 T 330 260 T 360 360 T 400 470"
              fill="none"
              stroke="url(#yamunaGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.85"
            />
            <text x="365" y="290" fontSize="7.5" fill="#0369A1" fontWeight="700">Yamuna River</text>

            {/* Inner Ring Road */}
            <ellipse
              cx="250"
              cy="235"
              rx="95"
              ry="80"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.8"
              opacity="0.8"
            />

            {/* Outer Ring Road */}
            <ellipse
              cx="250"
              cy="235"
              rx="155"
              ry="140"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.75"
            />

            {/* Interactive Zones */}
            {/* SOUTH DELHI & GURGAON (Golf Course Rd, Cyber City, Saket, GK) */}
            <path
              d="M 180 270 L 320 270 L 350 460 L 120 460 L 150 350 Z"
              fill={getZoneFill('South')}
              stroke={getZoneStroke('South')}
              strokeWidth={getZoneStrokeWidth('South')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('South')}
              onMouseEnter={() => setHoveredZone('South')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* WEST DELHI & DWARKA (Dwarka Expressway, Janakpuri, IGI Airport) */}
            <path
              d="M 60 210 L 180 210 L 180 340 L 90 410 L 40 330 Z"
              fill={getZoneFill('West')}
              stroke={getZoneStroke('West')}
              strokeWidth={getZoneStrokeWidth('West')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('West')}
              onMouseEnter={() => setHoveredZone('West')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* EAST DELHI & NOIDA (Noida Expressway, Sec 150, Mayur Vihar) */}
            <path
              d="M 330 190 L 460 190 L 470 410 L 350 400 L 330 270 Z"
              fill={getZoneFill('East')}
              stroke={getZoneStroke('East')}
              strokeWidth={getZoneStrokeWidth('East')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('East')}
              onMouseEnter={() => setHoveredZone('East')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* NORTH DELHI (Rohini, Pitampura, Civil Lines) */}
            <path
              d="M 120 60 L 350 60 L 320 180 L 140 180 Z"
              fill={getZoneFill('North')}
              stroke={getZoneStroke('North')}
              strokeWidth={getZoneStrokeWidth('North')}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('North')}
              onMouseEnter={() => setHoveredZone('North')}
              onMouseLeave={() => setHoveredZone(null)}
            />

            {/* Central Connaught Place (CP concentric circles) */}
            <circle cx="250" cy="205" r="14" fill="#0F4C5C" fillOpacity="0.15" stroke="#0F4C5C" strokeWidth="1.5" />
            <circle cx="250" cy="205" r="4.5" fill="#0F4C5C" />
            <text x="250" y="195" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#0F4C5C">
              Connaught Place
            </text>
            <circle cx="250" cy="235" r="3.5" fill="#B44D27" />
            <text x="250" y="246" textAnchor="middle" fontSize="7" fontWeight="600" fill="#5C220D">
              India Gate
            </text>

            {/* IGI Airport Runways in West */}
            <rect x="110" y="310" width="45" height="18" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
            <line x1="115" y1="315" x2="145" y2="315" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="132" y="340" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#0F4C5C">
              ✈ IGI Airport T3
            </text>

            {/* South & Gurgaon Landmarks */}
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('South')}
            >
              <circle cx="240" cy="300" r="4" fill="#64748B" stroke="#FFF" strokeWidth="1" />
              <text x="240" y="292" textAnchor="middle" fontSize="7" fontWeight="600" fill="#152226">
                Saket / GK
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('South')}
            >
              <circle cx="180" cy="410" r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              <text x="180" y="400" textAnchor="middle" fontSize="8" fontWeight="700" fill="#152226">
                Cyber City Gurgaon
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('South')}
            >
              <circle cx="205" cy="445" r="5" fill="#B44D27" stroke="#FFF" strokeWidth="1.5" />
              <text x="205" y="437" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#B44D27">
                Golf Course Rd
              </text>
            </g>

            {/* East / Noida */}
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('East')}
            >
              <circle cx="390" cy="270" r="4.5" fill="#64748B" stroke="#FFF" strokeWidth="1" />
              <text x="390" y="262" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#152226">
                Noida Sec 18
              </text>
            </g>
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('East')}
            >
              <circle cx="430" cy="380" r="5" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              <text x="430" y="372" textAnchor="middle" fontSize="8" fontWeight="700" fill="#152226">
                Noida Sec 150
              </text>
            </g>

            {/* North / Rohini */}
            <g
              className="cursor-pointer"
              onClick={() => onSelectZone('North')}
            >
              <circle cx="190" cy="110" r="4.5" fill="#64748B" stroke="#FFF" strokeWidth="1" />
              <text x="190" y="100" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#152226">
                Rohini / Pitampura
              </text>
            </g>
          </svg>
        )}

        {/* Hover / Active Badge overlay */}
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#D0DDD7] flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-1.5 truncate">
            <Compass className="w-3.5 h-3.5 text-[#0F4C5C] shrink-0" />
            <span className="font-semibold text-[#152226] truncate">
              {hoveredLandmark || `${selectedZone || 'East'} ${city} Corridor`}
            </span>
          </div>
          <span className="font-['Red_Hat_Mono'] text-[10px] font-bold text-[#0F4C5C] bg-[#D2E8ED] px-1.5 py-0.5 rounded shrink-0">
            Click zone to select
          </span>
        </div>
      </div>

      {/* Cartographic Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#4B5E63] pt-1 border-t border-[#D0DDD7]/70 w-full">
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded-full bg-[#F59E0B]" /> Outer Ring Road
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded-full bg-[#EF4444]" /> Expressways
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded-full bg-[#7DD3FC]" /> Lakes / Rivers
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded-full bg-[#9333EA]" /> Metro Transit
        </span>
      </div>
    </div>
  );
};
