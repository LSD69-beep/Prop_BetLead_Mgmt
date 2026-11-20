import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FLATS_DATABASE } from '../data/mockData';
import { GoogleCityMap } from '../components/GoogleCityMap';
import {
  ShieldCheck,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  MapPin,
  Layers,
  ArrowRight,
  Calculator,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';

export const FlatDetail: React.FC = () => {
  const { selectedFlatId, navigate, bookSiteVisit, savedFlatIds, toggleSaveFlat } = useApp();
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitBooked, setVisitBooked] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-11-22');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [activeFloorplanBhk, setActiveFloorplanBhk] = useState<'2bhk' | '3bhk' | '4bhk'>('3bhk');
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null);

  // Interactive EMI & 5-Year ROI Simulator state
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.65);

  const flat =
    FLATS_DATABASE.find((f) => f.id === selectedFlatId) || FLATS_DATABASE[0];

  const isSaved = savedFlatIds.includes(flat.id);

  const financialModel = useMemo(() => {
    const totalPriceInr = flat.priceNum * 100000;
    const downPaymentInr = (totalPriceInr * downPaymentPct) / 100;
    const loanPrincipal = Math.max(0, totalPriceInr - downPaymentInr);
    const monthlyRate = interestRate / 12 / 100;
    const months = tenureYears * 12;
    const emi =
      monthlyRate > 0 && months > 0
        ? (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1)
        : 0;
    const totalPayable = emi * months;
    const totalInterest = Math.max(0, totalPayable - loanPrincipal);
    const principalSharePct =
      totalPayable > 0 ? Math.round((loanPrincipal / totalPayable) * 100) : 50;
    const projected5YrValueCr = ((totalPriceInr * Math.pow(1.095, 5)) / 10000000).toFixed(2);
    const annualRentalInr = Math.round(totalPriceInr * 0.038);
    return {
      downPaymentLakhs: (downPaymentInr / 100000).toFixed(1),
      loanLakhs: (loanPrincipal / 100000).toFixed(1),
      emiInr: Math.round(emi),
      totalInterestCr: (totalInterest / 10000000).toFixed(2),
      principalSharePct,
      projected5YrValueCr,
      monthlyRentalInr: Math.round(annualRentalInr / 12),
    };
  }, [flat.priceNum, downPaymentPct, tenureYears, interestRate]);

  const galleryItems =
    flat.galleryImages && flat.galleryImages.length > 0
      ? flat.galleryImages
      : [
          { title: `${flat.name} Exterior`, category: 'Property Hero', src: flat.image },
          {
            title: '2 BHK Modern CAD Plan',
            category: 'Floor Plan',
            src: '/src/assets/images/floorplan_2bhk_modern_1795170525120.jpg',
          },
          {
            title: '3 BHK Luxury Sky Deck Plan',
            category: 'Floor Plan',
            src: '/src/assets/images/floorplan_3bhk_luxury_1795170526504.jpg',
          },
          {
            title: 'Architectural Isometric CAD',
            category: 'Spatial Model',
            src: '/src/assets/images/architectural_floorplan_view_1795020657957.jpg',
          },
        ];

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    bookSiteVisit(flat.id, selectedDate, selectedSlot);
    setVisitBooked(true);
    setTimeout(() => {
      setShowVisitModal(false);
      setVisitBooked(false);
    }, 2200);
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 bg-[#F2F5F3]">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[#4B5E63]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('customer-matching-flats')}
              className="hover:text-[#0F4C5C] transition-colors cursor-pointer"
            >
              Matching Flats
            </button>
            <span>/</span>
            <span className="text-[#152226] font-semibold">{flat.name}</span>
          </div>

          <button
            onClick={() => navigate('customer-developer-stocks', { devId: flat.devId })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C5C] hover:underline cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#B44D27]" />
            <span>View {flat.company} Stock Quotes</span>
          </button>
        </div>

        {/* Hero Card: Enlarged Image & Title */}
        <section className="rounded-2xl bg-white border border-[#D0DDD7] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 min-h-[320px] lg:min-h-[420px] bg-[#E9EFEA] relative">
            <img
              src={flat.image}
              alt={flat.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-[#0F4C5C] text-white font-['Red_Hat_Mono'] text-xs font-bold tabular-nums shadow-sm">
                GlassWindow Score: {flat.score}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D] font-['Red_Hat_Mono'] text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  RERA Verified
                </span>
                <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
                  RERA: {flat.reraNumber}
                </span>
              </div>

              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#152226] text-balance">
                {flat.name}
              </h1>

              <p className="text-base text-[#4B5E63] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0F4C5C] shrink-0" />
                {flat.locality}
              </p>

              <p className="text-xs sm:text-sm text-[#4B5E63] leading-relaxed mt-1">
                {flat.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {flat.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2.5 py-1 rounded-md bg-[#F2F5F3] border border-[#D0DDD7] text-xs font-medium text-[#152226]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#D0DDD7]">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#4B5E63]">Total Selling Price</span>
                <span className="font-['Playfair_Display'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
                  {flat.price}
                </span>
                <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63] tabular-nums">
                  {flat.rate}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#4B5E63]">Advance Token Payment</span>
                <span className="font-['Playfair_Display'] text-2xl font-bold text-[#B44D27] tabular-nums">
                  {flat.advance}
                </span>
                <span className="text-xs text-[#4B5E63]">10% Booking deposit</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setShowVisitModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Site Visit</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSaveFlat(flat.id)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer shadow-xs ${
                  isSaved
                    ? 'bg-[#FCE8E0] border-[#B44D27] text-[#B44D27]'
                    : 'bg-white border-[#D0DDD7] hover:border-[#0F4C5C] text-[#152226]'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSaved ? 'Shortlisted' : 'Shortlist'}</span>
              </button>

              <button
                onClick={() => navigate('customer-developer-stocks', { devId: flat.devId })}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#D0DDD7] hover:border-[#0F4C5C] text-[#0F4C5C] font-semibold text-sm transition-all cursor-pointer shadow-xs"
              >
                <TrendingUp className="w-4 h-4 text-[#B44D27]" />
                <span>Developer Stocks</span>
              </button>
            </div>
          </div>
        </section>

        {/* 80-Point Engineering & Due Diligence Visualizer */}
        <section
          aria-label="80-point engineering due diligence audit"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D0DDD7]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#D2E8ED] text-[#09323D] font-['Red_Hat_Mono'] text-xs font-bold">
                  GlassWindow Advisory Protocol
                </span>
                <span className="text-xs text-[#4B5E63] font-['Red_Hat_Mono']">
                  80-Point Independent Physical &amp; Legal Audit
                </span>
              </div>
              <h2 className="font-['Montserrat'] text-2xl font-bold text-[#152226]">
                Structural &amp; Regulatory Audit Scorecard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-[#4B5E63] block">Composite Diligence Index</span>
                <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
                  {flat.score}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* SVG Spider / Radar Chart (6 Dimensions) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#F9FBFA] rounded-xl border border-[#D0DDD7]">
              <span className="text-xs font-semibold text-[#4B5E63] uppercase tracking-wider mb-2">
                6-Dimension Resilience Polygon
              </span>

              {(() => {
                const sc = flat.auditScorecard || {
                  structural: 9.4,
                  legalClearance: 10.0,
                  waterSecurity: 9.1,
                  acousticInsulation: 9.3,
                  carpetEfficiency: 9.4,
                  liquidityScore: 9.0,
                  localityAvgRate: 13200,
                  floorplanCutawayImage: '/src/assets/images/architectural_floorplan_view_1795020657957.jpg',
                };

                const axes = [
                  { label: 'Structural', val: sc.structural, desc: 'M6 seismic rated RCC raft foundation' },
                  { label: 'Legal Clear', val: sc.legalClearance, desc: '45-year clean title & RERA registered' },
                  { label: 'Water Security', val: sc.waterSecurity, desc: 'Dual borewell & STP recycling grid' },
                  { label: 'Acoustic Barrier', val: sc.acousticInsulation, desc: '48dB sound-damped double glazing' },
                  { label: 'Carpet Efficacy', val: sc.carpetEfficiency, desc: 'Zero wasted passage space layout' },
                  { label: 'Liquidity', val: sc.liquidityScore, desc: 'Prime resale velocity in top 5%' },
                ];

                const cx = 150;
                const cy = 145;
                const r = 95;
                const totalAxes = axes.length;

                // Levels 0.2, 0.4, 0.6, 0.8, 1.0
                const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

                const getCoordinates = (index: number, valueFraction: number) => {
                  const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
                  return {
                    x: cx + r * valueFraction * Math.cos(angle),
                    y: cy + r * valueFraction * Math.sin(angle),
                  };
                };

                const dataPoints = axes.map((a, i) => getCoordinates(i, a.val / 10));
                const polygonPath = dataPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ') + ' Z';

                return (
                  <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                    <svg viewBox="0 0 300 290" className="w-full h-full overflow-visible">
                      {/* Concentric Polygons */}
                      {levels.map((lvl) => {
                        const levelPoints = axes
                          .map((_, i) => getCoordinates(i, lvl))
                          .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
                          .join(' ') + ' Z';
                        return (
                          <path
                            key={lvl}
                            d={levelPoints}
                            fill="none"
                            stroke="#D0DDD7"
                            strokeWidth={lvl === 1.0 ? '1.5' : '1'}
                            strokeDasharray={lvl === 1.0 ? 'none' : '3 3'}
                          />
                        );
                      })}

                      {/* Radial Spokes */}
                      {axes.map((_, i) => {
                        const pt = getCoordinates(i, 1.0);
                        return (
                          <line
                            key={i}
                            x1={cx}
                            y1={cy}
                            x2={pt.x}
                            y2={pt.y}
                            stroke="#D0DDD7"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Radar Data Polygon */}
                      <path
                        d={polygonPath}
                        fill="#0F4C5C"
                        fillOpacity="0.22"
                        stroke="#0F4C5C"
                        strokeWidth="2.5"
                      />

                      {/* Vertices & Labels */}
                      {axes.map((axis, i) => {
                        const pt = dataPoints[i];
                        const labelPt = getCoordinates(i, 1.22);
                        return (
                          <g key={axis.label}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4.5"
                              fill="#0F4C5C"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                            <text
                              x={labelPt.x}
                              y={labelPt.y}
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="text-[10px] font-['Red_Hat_Mono'] font-bold fill-[#152226]"
                            >
                              {axis.label} ({axis.val})
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}

              <p className="text-[11px] text-[#4B5E63] text-center mt-2">
                Concentric rings calibrate against 80 structural benchmarks certified by registered RERA civil engineers.
              </p>
            </div>

            {/* Metric Bars & Detailed Inspection Findings */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {(() => {
                const sc = flat.auditScorecard || {
                  structural: 9.4,
                  legalClearance: 10.0,
                  waterSecurity: 9.1,
                  acousticInsulation: 9.3,
                  carpetEfficiency: 9.4,
                  liquidityScore: 9.0,
                  localityAvgRate: 13200,
                  floorplanCutawayImage: '/src/assets/images/architectural_floorplan_view_1795020657957.jpg',
                };

                const metrics = [
                  {
                    title: 'Structural Integrity & Concrete Strength',
                    score: sc.structural,
                    desc: 'M60-grade concrete, ultrasonic pulse velocity tested, zero micro-cracks in core columns.',
                  },
                  {
                    title: 'Title Deeds & RERA Compliance',
                    score: sc.legalClearance,
                    desc: 'Clear 45-year title lineage, unconditional Khata A certificate, zero court stays or encumbrances.',
                  },
                  {
                    title: 'Water Security & Groundwater Yield',
                    score: sc.waterSecurity,
                    desc: 'Dual yield borewells, 1.5 MLD rain harvesting retention tank, Kaveri/Manjeera grid hooked.',
                  },
                  {
                    title: 'Acoustic Damping & Thermal Shield',
                    score: sc.acousticInsulation,
                    desc: 'Double-glazed Low-E hermetic glass, 48dB noise reduction from primary arterial corridors.',
                  },
                  {
                    title: 'Carpet Area Usability Ratio',
                    score: sc.carpetEfficiency,
                    desc: `Measured ${flat.carpet} net usable carpet ratio vs industry typical 64% threshold.`,
                  },
                  {
                    title: 'Secondary Resale Liquidity Index',
                    score: sc.liquidityScore,
                    desc: 'Historical 18-day average resale velocity with 8.4% annual capital appreciation rate.',
                  },
                ];

                return (
                  <div className="space-y-3">
                    {metrics.map((m) => (
                      <div key={m.title} className="p-3 rounded-xl bg-[#F9FBFA] border border-[#D0DDD7] flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#152226]">{m.title}</span>
                          <span className="font-['Red_Hat_Mono'] font-bold text-[#0F4C5C] tabular-nums">
                            {m.score.toFixed(1)} / 10.0
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#E9EFEA] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#0F4C5C] transition-all duration-500"
                            style={{ width: `${(m.score / 10) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[#4B5E63]">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* 3D Architectural Cutaway Floorplan View with Multi-BHK Explorer */}
        <section
          aria-label="3D architectural cutaway floorplan view"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D0DDD7]">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-[#0F4C5C] tracking-wider">
                Spatial Architecture &amp; Ergonomics
              </span>
              <h2 className="font-['Montserrat'] text-2xl font-bold text-[#152226]">
                3D Cutaway Architectural Floorplan Explorer
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5E63]">
                Switch between CAD layouts to inspect room ergonomics, usable carpet ratios, and ventilation corridors.
              </p>
            </div>

            {/* BHK Floorplan Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7]">
              {[
                { id: '2bhk', label: '2 BHK Modern (1,205 sq.ft)' },
                { id: '3bhk', label: '3 BHK Sky Suite (1,945 sq.ft)' },
                { id: '4bhk', label: '4+ BHK Penthouse (3,415 sq.ft)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFloorplanBhk(tab.id as '2bhk' | '3bhk' | '4bhk')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeFloorplanBhk === tab.id
                      ? 'bg-[#0F4C5C] text-white shadow-xs'
                      : 'text-[#4B5E63] hover:text-[#152226]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const currentFloorplan =
              activeFloorplanBhk === '2bhk'
                ? {
                    title: '2 BHK Modern Executive Layout (1,205 sq.ft)',
                    image: '/src/assets/images/floorplan_2bhk_modern_1795170525120.jpg',
                    carpet: '74% Usable Carpet',
                    carpetPct: 74,
                    scale: '1:50 Laser Verified CAD',
                    rooms: [
                      {
                        name: 'Living & Dining Room',
                        area: "13.0' x 15.8' (205 sq.ft)",
                        share: '25%',
                        features: 'Seamless access to sunlit verandah, cross ventilation corridor',
                      },
                      {
                        name: 'Primary Master Suite',
                        area: "17.6' x 13.3' (234 sq.ft)",
                        share: '28%',
                        features: "En-suite bathroom (6.4' x 11.2'), wardrobe recess, large window bays",
                      },
                      {
                        name: 'Secondary Guest Bedroom',
                        area: "10.6' x 11.2' (118 sq.ft)",
                        share: '15%',
                        features: "Directly adjacent to common bathroom (3.8' x 5.5')",
                      },
                      {
                        name: 'Kitchen & Utility Yard',
                        area: "13.6' x 13.5' (184 sq.ft)",
                        share: '20%',
                        features: "Open breakfast island, dedicated laundry utility (9.8' x 17.8')",
                      },
                      {
                        name: 'Sunlit Balcony Verandah',
                        area: "10.5' x 15.0' (157 sq.ft)",
                        share: '12%',
                        features: 'Anti-skid porcelain tiling with panoramic landscaped views',
                      },
                    ],
                  }
                : activeFloorplanBhk === '3bhk'
                ? {
                    title: '3 BHK Panoramic Sky Suite Layout (1,945 sq.ft)',
                    image: '/src/assets/images/floorplan_3bhk_luxury_1795170526504.jpg',
                    carpet: '76% Usable Carpet',
                    carpetPct: 76,
                    scale: '1:50 CAD High-Rise Model',
                    rooms: [
                      {
                        name: 'Great Room & Dining Salon',
                        area: '620 sq.ft',
                        share: '32%',
                        features: 'Triple-aspect living pavilion with wrap-around sky deck terrace',
                      },
                      {
                        name: 'Primary Master Suite',
                        area: '440 sq.ft',
                        share: '23%',
                        features: 'Walk-in dressing closet & marble en-suite bath with freestanding tub',
                      },
                      {
                        name: 'Secondary Bedrooms 2 & 3',
                        area: '480 sq.ft',
                        share: '25%',
                        features: 'Acoustic-damped double glazing with private en-suite baths',
                      },
                      {
                        name: 'Wrap-around Sky Deck',
                        area: '340 sq.ft',
                        share: '14%',
                        features: '360-degree skyline views with frameless glass balustrades',
                      },
                      {
                        name: 'Gourmet Kitchen & Powder Room',
                        area: '210 sq.ft',
                        share: '6%',
                        features: 'Central quartz island, concealed utility, and guest washroom',
                      },
                    ],
                  }
                : {
                    title: '4+ BHK Bespoke Presidential Penthouse / Villa (3,415 sq.ft)',
                    image: '/src/assets/images/architectural_floorplan_view_1795020657957.jpg',
                    carpet: '78% Usable Carpet',
                    carpetPct: 78,
                    scale: '1:25 Architectural Cutaway',
                    rooms: [
                      {
                        name: 'Double-Height Atrium Salon',
                        area: '780 sq.ft',
                        share: '30%',
                        features: '18ft clear vertical volume with floor-to-ceiling glass walls',
                      },
                      {
                        name: 'Presidential Master Suite',
                        area: '580 sq.ft',
                        share: '22%',
                        features: 'Private sitting lounge, dual walk-in closets, marble steam shower',
                      },
                      {
                        name: 'Guest & Children Suites (3 Units)',
                        area: '820 sq.ft',
                        share: '32%',
                        features: 'Individual private balconies with acoustic insulation',
                      },
                      {
                        name: 'Private Lap Pool & Sky Deck',
                        area: '450 sq.ft',
                        share: '16%',
                        features: 'Heated infinity plunge pool with teak sundeck lounge',
                      },
                    ],
                  };

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Cutaway Image */}
                <div className="lg:col-span-7 rounded-xl overflow-hidden border border-[#D0DDD7] bg-[#E9EFEA] relative group">
                  <img
                    src={currentFloorplan.image}
                    alt={currentFloorplan.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-102 cursor-pointer"
                    onClick={() => setActiveGalleryImage(currentFloorplan.image)}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-[#0F4C5C] shadow-xs">
                    {currentFloorplan.carpet}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg text-xs font-['Red_Hat_Mono'] font-bold text-[#152226] shadow-xs flex items-center gap-1.5">
                    <span>📐 {currentFloorplan.scale}</span>
                    <span className="text-[#4B5E63]">(Click to enlarge)</span>
                  </div>
                </div>

                {/* Spatial Breakdown Cards */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5E63]">
                      Room Spatial Allocation
                    </h3>
                    <span className="text-xs font-bold font-['Red_Hat_Mono'] text-[#0F4C5C]">
                      {currentFloorplan.title.split('(')[0]}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentFloorplan.rooms.map((room) => (
                      <div
                        key={room.name}
                        className="p-3 rounded-xl bg-[#F9FBFA] border border-[#D0DDD7] hover:border-[#0F4C5C] transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#152226]">{room.name}</span>
                          <span className="font-['Red_Hat_Mono'] font-bold text-[#0F4C5C] tabular-nums">
                            {room.area} ({room.share})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4B5E63] mt-1">{room.features}</p>
                      </div>
                    ))}
                  </div>

                  {/* Usable Carpet Area Benchmark Meter */}
                  <div className="mt-2 p-3.5 rounded-xl bg-[#D2E8ED]/40 border border-[#0F4C5C]/20 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#09323D]">Carpet Usability Benchmark</span>
                      <span className="font-['Red_Hat_Mono'] font-bold text-[#0F4C5C]">
                        +{currentFloorplan.carpetPct - 64}% Above Industry Median
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white overflow-hidden flex">
                      <div
                        className="bg-[#0F4C5C] h-full"
                        style={{ width: `${currentFloorplan.carpetPct}%` }}
                        title={`Usable Carpet: ${currentFloorplan.carpetPct}%`}
                      />
                      <div
                        className="bg-[#8FA3A8] h-full"
                        style={{ width: `${100 - currentFloorplan.carpetPct}%` }}
                        title={`Common Areas: ${100 - currentFloorplan.carpetPct}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#4B5E63]">
                      <span>{currentFloorplan.carpetPct}% Net Usable Carpet</span>
                      <span>{100 - currentFloorplan.carpetPct}% Common &amp; Wall Share</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Architectural Imagery & Interior Gallery */}
        <section
          aria-label="Architectural image gallery"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D0DDD7]">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-[#0F4C5C] tracking-wider">
                Visual Documentation
              </span>
              <h2 className="font-['Montserrat'] text-2xl font-bold text-[#152226]">
                Architectural Imagery &amp; Interior Gallery
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#0F4C5C] bg-[#E9F3F5] px-3 py-1.5 rounded-lg font-['Red_Hat_Mono'] font-bold">
              <Camera className="w-3.5 h-3.5" />
              {galleryItems.length} High-Res Photos • Click to enlarge
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((imgItem, idx) => (
              <div
                key={`${imgItem.title}-${idx}`}
                onClick={() => setActiveGalleryImage(imgItem.src)}
                className="group relative aspect-4/3 rounded-xl overflow-hidden bg-[#E9EFEA] border border-[#D0DDD7] hover:border-[#0F4C5C] transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <img
                  src={imgItem.src}
                  alt={imgItem.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-bold uppercase text-white tracking-wider">
                  {imgItem.category}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                  <span className="text-[11px] font-semibold text-white truncate">
                    {imgItem.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Modal with Prev/Next Navigation */}
          {activeGalleryImage && (() => {
            const activeIdx = galleryItems.findIndex((g) => g.src === activeGalleryImage);
            const activeItem = activeIdx >= 0 ? galleryItems[activeIdx] : null;
            return (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
                onClick={() => setActiveGalleryImage(null)}
              >
                <div
                  className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-[#0E181B] shadow-2xl flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setActiveGalleryImage(null)}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center cursor-pointer text-lg"
                  >
                    ✕
                  </button>

                  {galleryItems.length > 1 && activeIdx >= 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const prevIdx = (activeIdx - 1 + galleryItems.length) % galleryItems.length;
                          setActiveGalleryImage(galleryItems[prevIdx].src);
                        }}
                        aria-label="Previous photo"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/65 text-white hover:bg-black flex items-center justify-center cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = (activeIdx + 1) % galleryItems.length;
                          setActiveGalleryImage(galleryItems[nextIdx].src);
                        }}
                        aria-label="Next photo"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/65 text-white hover:bg-black flex items-center justify-center cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <img
                    src={activeGalleryImage}
                    alt={activeItem?.title || 'Enlarged architectural view'}
                    className="max-h-[78vh] w-full object-contain mx-auto bg-black"
                  />

                  <div className="px-5 py-3 bg-[#152226] text-white flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      {activeItem && (
                        <span className="px-2 py-0.5 rounded bg-[#0F4C5C] font-['Red_Hat_Mono'] text-[10px] uppercase font-bold">
                          {activeItem.category}
                        </span>
                      )}
                      <span className="font-semibold">
                        {activeItem?.title || `${flat.name} Architectural View`}
                      </span>
                    </div>
                    {activeIdx >= 0 && (
                      <span className="font-['Red_Hat_Mono'] text-white/75 tabular-nums">
                        Photo {activeIdx + 1} of {galleryItems.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Micro-Market Price-Per-Sq.Ft Benchmark */}
        <section
          aria-label="Micro-market price comparison"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D0DDD7]">
            <div>
              <span className="text-xs uppercase font-bold text-[#0F4C5C] tracking-wider">
                Financial Evaluation
              </span>
              <h2 className="font-['Montserrat'] text-2xl font-bold text-[#152226]">
                Price-per-sq.ft Benchmark Comparison
              </h2>
            </div>
            <div className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
              Micro-Market: {flat.locality}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#E9F3F5] border border-[#0F4C5C]/30 flex flex-col gap-1">
              <span className="text-xs text-[#4B5E63]">This Property Rate</span>
              <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
                {flat.rate}
              </span>
              <span className="text-[11px] text-[#09323D] font-medium">
                Audited builder price with premium specifications
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F9FBFA] border border-[#D0DDD7] flex flex-col gap-1">
              <span className="text-xs text-[#4B5E63]">Locality Median Rate</span>
              <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#152226] tabular-nums">
                ₹{(flat.auditScorecard?.localityAvgRate || 13500).toLocaleString('en-IN')} / sq.ft
              </span>
              <span className="text-[11px] text-[#4B5E63]">
                Weighted average of completed RERA projects within 3km
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F9FBFA] border border-[#D0DDD7] flex flex-col gap-1">
              <span className="text-xs text-[#4B5E63]">5-Yr Projected Annual Return</span>
              <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#1F7A4C] tabular-nums">
                +11.4% p.a.
              </span>
              <span className="text-[11px] text-[#4B5E63]">
                Projected capital gain &amp; 3.8% gross rental yield
              </span>
            </div>
          </div>

          {/* Interactive EMI, Down Payment & 5-Year ROI Simulator */}
          <div className="pt-6 border-t border-[#D0DDD7] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#0F4C5C]" />
                <h3 className="text-sm font-bold text-[#152226]">
                  Interactive Mortgage, Down Payment &amp; ROI Simulator
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#4B5E63]">Down Payment Share</span>
                    <span className="font-['Red_Hat_Mono'] font-bold text-[#0F4C5C]">
                      {downPaymentPct}% (₹{financialModel.downPaymentLakhs} L)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full accent-[#0F4C5C] cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#4B5E63]">Loan Tenure</span>
                    <span className="font-['Red_Hat_Mono'] font-bold text-[#0F4C5C]">
                      {tenureYears} Years
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={5}
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full accent-[#0F4C5C] cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#4B5E63]">Bank Interest Rate</span>
                    <span className="font-['Red_Hat_Mono'] font-bold text-[#B44D27]">
                      {interestRate.toFixed(2)}% p.a.
                    </span>
                  </div>
                  <input
                    type="range"
                    min={7.5}
                    max={10.5}
                    step={0.15}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-[#B44D27] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#F9FBFA] border border-[#D0DDD7] flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-[#4B5E63] block">Estimated Monthly EMI</span>
                  <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
                    ₹{financialModel.emiInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#4B5E63] block">Est. Monthly Rental Yield</span>
                  <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#1F7A4C] tabular-nums">
                    ₹{financialModel.monthlyRentalInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-['Red_Hat_Mono']">
                  <span className="text-[#0F4C5C] font-semibold">
                    Principal ({financialModel.principalSharePct}%): ₹{financialModel.loanLakhs} L
                  </span>
                  <span className="text-[#B44D27] font-semibold">
                    Total Interest: ₹{financialModel.totalInterestCr} Cr
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#FCE8E0] overflow-hidden flex">
                  <div
                    className="bg-[#0F4C5C] h-full transition-all"
                    style={{ width: `${financialModel.principalSharePct}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#D0DDD7] flex items-center justify-between text-xs">
                <span className="text-[#4B5E63]">5-Year Asset Appreciation @ 9.5% CAGR</span>
                <span className="font-['Red_Hat_Mono'] font-bold text-[#1F7A4C] tabular-nums">
                  ₹{financialModel.projected5YrValueCr} Cr
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Google Maps Neighborhood & 2km Audited Comparables */}
        <section
          aria-label="Google Maps neighborhood and comparables"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#D0DDD7]">
            <div>
              <span className="text-xs uppercase font-bold text-[#0F4C5C] tracking-wider">
                Google Maps Platform • Neighborhood GIS
              </span>
              <h2 className="font-['Montserrat'] text-2xl font-bold text-[#152226]">
                Property Micro-Market &amp; Nearby Audited Comparables
              </h2>
            </div>
            <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
              {flat.lat.toFixed(4)}° N, {flat.lng.toFixed(4)}° E
            </span>
          </div>

          <GoogleCityMap
            mode="flat-detail"
            flat={flat}
            onSelectComparable={(compId) => navigate('customer-flat-detail', { flatId: compId })}
            heightClass="h-[360px] sm:h-[400px]"
          />
        </section>

        {/* Two Enlarged Cards: Flat Specifications & Pricing/Owner Contact */}
        <section
          aria-label="Flat specifications and owner contact"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Card 1: Flat Specifications */}
          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D0DDD7]">
              <h2 className="font-['Montserrat'] text-xl font-bold text-[#152226]">
                Flat Specifications
              </h2>
              <span className="text-xs font-semibold text-[#0F4C5C] bg-[#D2E8ED] px-2.5 py-1 rounded-md flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                {flat.carpet}
              </span>
            </div>

            <dl className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Apartment Name</dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">{flat.name}</dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Developer Company</dt>
                <dd className="text-right">
                  <button
                    onClick={() => navigate('customer-developer-stocks', { devId: flat.devId })}
                    className="font-semibold text-sm text-[#0F4C5C] hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <span>{flat.company}</span>
                    <ArrowRight className="w-3 h-3 text-[#B44D27]" />
                  </button>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Property Type</dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">{flat.type}</dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Floor &amp; Unit Number</dt>
                <dd className="font-['Red_Hat_Mono'] text-sm font-bold text-[#152226] tabular-nums text-right">
                  {flat.flatNo} • {flat.floor}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Vastu &amp; Orientation</dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">
                  {flat.facing || 'East Facing (Vastu Compliant)'}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Possession Timeline</dt>
                <dd className="font-['Red_Hat_Mono'] text-sm font-semibold text-[#1F7A4C] text-right">
                  {flat.possession || 'Ready / Q4 2026'}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Parking &amp; Baths / Balconies</dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">
                  {flat.parking || '2 Covered Bays'} • {flat.bathrooms || 3} Baths • {flat.balconies || 2} Balconies
                </dd>
              </div>

              {flat.highlights && flat.highlights.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
                    Key Architectural Highlights
                  </dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {flat.highlights.map((hl) => (
                      <span
                        key={hl}
                        className="px-2.5 py-1 rounded-md bg-[#E9F3F5] text-[#09323D] text-[11px] font-semibold"
                      >
                        ✓ {hl}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Card 2: Pricing & Owner Contact */}
          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D0DDD7]">
              <h2 className="font-['Montserrat'] text-xl font-bold text-[#152226]">
                Pricing &amp; Owner Contact
              </h2>
              <span className="text-xs font-semibold text-[#14532D] bg-[#DCFCE7] px-2.5 py-1 rounded-md">
                Verified Title
              </span>
            </div>

            <dl className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Total Selling Price</dt>
                <dd className="font-['Red_Hat_Mono'] text-base font-bold text-[#0F4C5C] tabular-nums text-right">
                  {flat.price}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Advance Payment</dt>
                <dd className="font-['Red_Hat_Mono'] text-base font-bold text-[#B44D27] tabular-nums text-right">
                  {flat.advance}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Owner Email ID</dt>
                <dd className="text-right">
                  <a
                    href={`mailto:${flat.email}`}
                    className="font-medium text-sm text-[#0F4C5C] hover:underline flex items-center gap-1.5 ml-auto"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#4B5E63]" />
                    <span>{flat.email}</span>
                  </a>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Owner Phone No</dt>
                <dd className="text-right">
                  <a
                    href={`tel:${flat.phone}`}
                    className="font-['Red_Hat_Mono'] text-sm font-semibold text-[#152226] hover:text-[#0F4C5C] flex items-center gap-1.5 ml-auto tabular-nums"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#4B5E63]" />
                    <span>{flat.phone}</span>
                  </a>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-[#4B5E63]">Carpet Area</dt>
                <dd className="font-['Red_Hat_Mono'] text-sm font-semibold text-[#152226] tabular-nums text-right">
                  {flat.config} ({flat.carpet})
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Modal for Booking Site Visit */}
        {showVisitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#D0DDD7] flex flex-col gap-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0F4C5C]" />
                  <h3 className="font-bold text-lg text-[#152226]">Schedule Site Walkthrough</h3>
                </div>
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {visitBooked ? (
                <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#1F7A4C]/30 text-[#14532D] text-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-[#1F7A4C]" />
                    <span>Visit Confirmed with Dedicated Advisor!</span>
                  </div>
                  <p className="text-xs">
                    Advisor Vikramaditya has been notified for {flat.name} on {selectedDate} at {selectedSlot}. An SMS confirmation has been dispatched.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookVisit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#4B5E63]">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-sm text-[#152226]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#4B5E63]">Time Slot</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-sm text-[#152226]"
                    >
                      <option value="10:00 AM">10:00 AM - Morning Slot</option>
                      <option value="11:30 AM">11:30 AM - Late Morning</option>
                      <option value="02:30 PM">02:30 PM - Afternoon Slot</option>
                      <option value="04:30 PM">04:30 PM - Golden Hour Walkthrough</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F2F5F3] text-xs text-[#4B5E63]">
                    Includes physical carpet area laser measurement check &amp; RERA legal audit binder.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0F4C5C] text-white font-semibold text-sm hover:bg-[#09323D] transition-colors cursor-pointer"
                  >
                    Confirm Walkthrough Appointment
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
