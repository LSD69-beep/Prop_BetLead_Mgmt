import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEVELOPERS_DATABASE } from '../data/mockData';
import {
  TrendingUp,
  TrendingDown,
  Check,
  Plus,
  ArrowRight,
  Building2,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

type TimeRange = '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y';

export const DeveloperStocks: React.FC = () => {
  const {
    selectedDeveloperId,
    setSelectedDeveloperId,
    followedStocks,
    toggleFollowStock,
    navigate,
  } = useApp();

  const [activeRange, setActiveRange] = useState<TimeRange>('1D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const developer =
    DEVELOPERS_DATABASE.find((d) => d.id === selectedDeveloperId) ||
    DEVELOPERS_DATABASE[0];

  const isFollowed = !!followedStocks[developer.id];

  const series = developer.series[activeRange] || developer.series['1D'];
  const labels = developer.labels[activeRange] || developer.labels['1D'];

  // SVG Chart Geometry
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const chartWidth = 720;
  const chartHeight = 280;
  const w = chartWidth - padLeft - padRight;
  const h = chartHeight - padTop - padBottom;

  const minVal = Math.min(...series) * 0.99;
  const maxVal = Math.max(...series) * 1.01;
  const valRange = maxVal - minVal || 1;

  const points = series.map((val, idx) => {
    const x = padLeft + (idx / (series.length - 1)) * w;
    const y = padTop + h - ((val - minVal) / valRange) * h;
    return { x, y, val };
  });

  const linePath = points
    .map((pt, idx) => (idx === 0 ? 'M ' : 'L ') + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1))
    .join(' ');

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${padTop + h} L ${points[0].x.toFixed(1)} ${padTop + h} Z`;

  const prevY = points[0].y;
  const strokeColor = developer.positive ? '#1F7A4C' : '#B91C1C';

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];
  const activeLabel = hoveredIndex !== null ? labels[hoveredIndex] : labels[labels.length - 1];

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 bg-[#F2F5F3]">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Top Developer Selector Banner */}
        <section
          aria-label="Select real estate developer"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[#152226]">
              Select Listed Real Estate Developer
            </h2>
            <span className="text-xs text-[#4B5E63]">
              Track live market quotes, solvency metrics &amp; project delivery histories
            </span>
          </div>

          <div className="w-full sm:w-96">
            <select
              aria-label="Select listed real estate developer"
              value={developer.id}
              onChange={(e) => setSelectedDeveloperId(e.target.value)}
              className="w-full min-h-[44px] rounded-xl bg-[#F2F5F3] border border-[#D0DDD7] px-4 py-2 font-semibold text-sm text-[#152226] focus:border-[#0F4C5C] focus:bg-white focus:ring-1 focus:ring-[#0F4C5C] cursor-pointer"
            >
              {DEVELOPERS_DATABASE.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ticker})
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Main Stock Graph + Company Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Google-Finance-Style Quote Header & Market Graph */}
          <section
            aria-label="Stock quote and market chart"
            className="lg:col-span-8 rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
          >
            {/* Header: Company Name, Ticker & Follow Button */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#D0DDD7]">
              <div className="flex flex-col gap-1">
                <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#152226] text-balance">
                  {developer.name}
                </h1>
                <span className="font-['Red_Hat_Mono'] text-xs font-semibold text-[#4B5E63]">
                  {developer.ticker}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleFollowStock(developer.id)}
                className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isFollowed
                    ? 'bg-[#D2E8ED] text-[#0F4C5C] border border-[#0F4C5C]/30'
                    : 'bg-[#0F4C5C] text-white hover:bg-[#09323D] shadow-xs'
                }`}
              >
                {isFollowed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>

            {/* Price Row */}
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#152226] tabular-nums">
                  {hoveredIndex !== null ? activePoint.val.toFixed(2) : developer.price}
                </span>
                <span className="text-sm font-semibold text-[#4B5E63]">INR</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-sm font-bold font-['Red_Hat_Mono'] tabular-nums ${
                    developer.positive ? 'text-[#1F7A4C]' : 'text-[#B91C1C]'
                  }`}
                >
                  {developer.positive ? (
                    <TrendingUp className="w-4 h-4 text-[#1F7A4C]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[#B91C1C]" />
                  )}
                  {developer.changeText}
                </span>

                {hoveredIndex !== null && (
                  <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
                    • Scrubber at {activeLabel}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#4B5E63] mt-1">{developer.timestamp}</p>
            </div>

            {/* Timeframe Tabs */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#D0DDD7]">
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Chart timeframe">
                {(['1D', '5D', '1M', '6M', '1Y', '5Y'] as TimeRange[]).map((range) => {
                  const isSelected = activeRange === range;
                  return (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setActiveRange(range)}
                      className={`px-3 py-1 rounded-md font-['Red_Hat_Mono'] text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F4C5C] text-white shadow-xs'
                          : 'bg-[#F2F5F3] text-[#4B5E63] hover:text-[#152226] border border-[#D0DDD7]'
                      }`}
                    >
                      {range}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63] hidden sm:inline">
                Dashed line = Prev close
              </span>
            </div>

            {/* Interactive SVG Stock Chart with Scrubber */}
            <div className="w-full rounded-xl bg-[#F2F5F3] border border-[#D0DDD7] p-4 relative overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto cursor-crosshair select-none"
                role="img"
                aria-label={`Market price graph for ${developer.name}`}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Grid lines and guides */}
                {[0, 1, 2, 3].map((g) => {
                  const gy = padTop + (g / 3) * h;
                  const gVal = Math.round(maxVal - (g / 3) * valRange);
                  return (
                    <g key={g}>
                      <line
                        x1={padLeft}
                        y1={gy}
                        x2={chartWidth - padRight}
                        y2={gy}
                        stroke="#D0DDD7"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 10}
                        y={gy + 4}
                        textAnchor="end"
                        fill="#4B5E63"
                        fontFamily="Red Hat Mono, monospace"
                        fontSize="11"
                      >
                        {gVal}
                      </text>
                    </g>
                  );
                })}

                {/* Prev close reference line */}
                <line
                  x1={padLeft}
                  y1={prevY}
                  x2={chartWidth - padRight}
                  y2={prevY}
                  stroke="#8FA3A8"
                  strokeDasharray="3 4"
                  strokeWidth="1.5"
                />

                {/* Area fill */}
                <path d={areaPath} fill="url(#stockAreaGrad)" />

                {/* Primary price curve */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Hover vertical crosshair & point indicator */}
                {hoveredIndex !== null && (
                  <g>
                    <line
                      x1={activePoint.x}
                      y1={padTop}
                      x2={activePoint.x}
                      y2={padTop + h}
                      stroke="#0F4C5C"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={activePoint.x}
                      cy={activePoint.y}
                      r="6"
                      fill={strokeColor}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Default last point dot if not hovering */}
                {hoveredIndex === null && (
                  <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="5"
                    fill={strokeColor}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}

                {/* X-axis tick labels */}
                {labels.map((lbl, idx) => {
                  const lx = padLeft + (idx / (labels.length - 1)) * w;
                  return (
                    <text
                      key={lbl + idx}
                      x={lx}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fill="#4B5E63"
                      fontFamily="Red Hat Mono, monospace"
                      fontSize="11"
                    >
                      {lbl}
                    </text>
                  );
                })}

                {/* Invisible hover capture slices */}
                {points.map((pt, idx) => {
                  const sliceWidth = w / points.length;
                  return (
                    <rect
                      key={idx}
                      x={pt.x - sliceWidth / 2}
                      y={padTop}
                      width={sliceWidth}
                      height={h}
                      fill="transparent"
                      onMouseEnter={() => setHoveredIndex(idx)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Key Market Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#D0DDD7]">
              <div className="flex flex-col">
                <span className="text-xs text-[#4B5E63]">Prev Close</span>
                <span className="font-['Red_Hat_Mono'] text-sm sm:text-base font-bold text-[#152226] tabular-nums">
                  {developer.prevClose}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#4B5E63]">Market Cap</span>
                <span className="font-['Red_Hat_Mono'] text-sm sm:text-base font-bold text-[#152226] tabular-nums">
                  {developer.mcap}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#4B5E63]">52W High</span>
                <span className="font-['Red_Hat_Mono'] text-sm sm:text-base font-bold text-[#152226] tabular-nums">
                  {developer.high52}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#4B5E63]">P/E Ratio</span>
                <span className="font-['Red_Hat_Mono'] text-sm sm:text-base font-bold text-[#152226] tabular-nums">
                  {developer.pe}
                </span>
              </div>
            </div>
          </section>

          {/* Right: Company Details & Linked Flat */}
          <aside
            aria-label="Company details"
            className="lg:col-span-4 rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#D0DDD7]">
              <h2 className="font-['Montserrat'] text-xl font-bold text-[#152226]">
                About Developer
              </h2>
              <span className="px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#14532D] text-xs font-semibold">
                Listed Entity
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#4B5E63] leading-relaxed">
              {developer.overview}
            </p>

            <dl className="flex flex-col gap-3 pt-2 border-t border-[#D0DDD7]">
              <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-[#D0DDD7]/60">
                <dt className="text-xs text-[#4B5E63] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Headquarters
                </dt>
                <dd className="font-semibold text-xs text-[#152226] text-right">
                  {developer.hq}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-[#D0DDD7]/60">
                <dt className="text-xs text-[#4B5E63] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Founded
                </dt>
                <dd className="font-['Red_Hat_Mono'] text-xs font-semibold text-[#152226] tabular-nums text-right">
                  {developer.founded}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-[#D0DDD7]/60">
                <dt className="text-xs text-[#4B5E63] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Delivered Area
                </dt>
                <dd className="font-['Red_Hat_Mono'] text-xs font-semibold text-[#152226] tabular-nums text-right">
                  {developer.delivered}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4">
                <dt className="text-xs text-[#4B5E63] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#0F4C5C]" />
                  GlassWindow Score
                </dt>
                <dd className="font-['Red_Hat_Mono'] text-xs font-bold text-[#0F4C5C] tabular-nums text-right">
                  {developer.score}
                </dd>
              </div>
            </dl>

            {/* Featured Flat Card */}
            <div className="pt-4 border-t border-[#D0DDD7] flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-[#4B5E63]">
                Featured Property on GlassWindow
              </span>
              <button
                onClick={() => navigate('customer-flat-detail', { flatId: developer.flatId })}
                className="w-full text-left rounded-xl bg-[#F2F5F3] hover:bg-[#E9EFEA] border border-[#D0DDD7] hover:border-[#0F4C5C] p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[#152226] group-hover:text-[#0F4C5C]">
                    {developer.flatName}
                  </span>
                  <span className="font-['Red_Hat_Mono'] text-xs text-[#4B5E63] tabular-nums">
                    {developer.flatPrice}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#0F4C5C] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </aside>
        </div>

        {/* Multi-Developer Comparative Stock Performance */}
        <section
          aria-label="Multi-developer peer benchmark"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D0DDD7]">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-[#0F4C5C] tracking-wider">
                Comparative Market Intelligence
              </span>
              <h2 className="font-['Montserrat'] text-xl sm:text-2xl font-bold text-[#152226]">
                Listed Developer Peer Performance Benchmark (1-Month Normalized)
              </h2>
            </div>
            <div className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
              Baseline: 0% at period start
            </div>
          </div>

          {/* Interactive Multi-Line SVG Chart */}
          {(() => {
            const devColors: Record<string, string> = {
              SOBHA: '#0F4C5C',
              DLF: '#B44D27',
              PRESTIGE: '#15803D',
              BRIGADE: '#4338CA',
              GODREJ: '#B45309',
            };

            const compWidth = 840;
            const compHeight = 240;
            const pL = 50;
            const pR = 30;
            const pT = 20;
            const pB = 35;
            const cw = compWidth - pL - pR;
            const ch = compHeight - pT - pB;

            // Calculate normalized returns (%) for each developer
            const normalizedData = DEVELOPERS_DATABASE.map((d) => {
              const raw = d.series['1M'] || d.series['1D'];
              const base = raw[0] || 1;
              const pctSeries = raw.map((val) => ((val - base) / base) * 100);
              return {
                id: d.id,
                name: d.shortName,
                color: devColors[d.id] || '#0F4C5C',
                series: pctSeries,
                finalPct: pctSeries[pctSeries.length - 1],
              };
            });

            // Find global min and max percent
            let minP = 0;
            let maxP = 0;
            normalizedData.forEach((d) => {
              d.series.forEach((val) => {
                if (val < minP) minP = val;
                if (val > maxP) maxP = val;
              });
            });
            minP = Math.floor(minP - 1);
            maxP = Math.ceil(maxP + 1);
            const pRange = maxP - minP || 1;

            const zeroY = pT + ch - ((0 - minP) / pRange) * ch;

            return (
              <div className="flex flex-col gap-4">
                {/* Developer Legend Chips */}
                <div className="flex flex-wrap items-center gap-3">
                  {normalizedData.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDeveloperId(d.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        developer.id === d.id
                          ? 'bg-[#E9F3F5] border-[#0F4C5C] text-[#0F4C5C] ring-1 ring-[#0F4C5C]'
                          : 'bg-white border-[#D0DDD7] text-[#152226] hover:bg-[#F2F5F3]'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span>{d.name}</span>
                      <span
                        className={`font-['Red_Hat_Mono'] font-bold tabular-nums ${
                          d.finalPct >= 0 ? 'text-[#1F7A4C]' : 'text-[#B91C1C]'
                        }`}
                      >
                        {d.finalPct >= 0 ? `+${d.finalPct.toFixed(1)}%` : `${d.finalPct.toFixed(1)}%`}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Chart Box */}
                <div className="w-full overflow-x-auto bg-[#F9FBFA] rounded-xl border border-[#D0DDD7] p-2">
                  <svg
                    viewBox={`0 0 ${compWidth} ${compHeight}`}
                    className="w-full h-auto min-w-[650px] overflow-visible"
                  >
                    {/* Horizontal Grid lines */}
                    {[minP, 0, maxP].map((val) => {
                      const yPos = pT + ch - ((val - minP) / pRange) * ch;
                      return (
                        <g key={val}>
                          <line
                            x1={pL}
                            y1={yPos}
                            x2={pL + cw}
                            y2={yPos}
                            stroke={val === 0 ? '#8FA3A8' : '#E9EFEA'}
                            strokeWidth={val === 0 ? '1.5' : '1'}
                            strokeDasharray={val === 0 ? 'none' : '4 4'}
                          />
                          <text
                            x={pL - 8}
                            y={yPos + 4}
                            textAnchor="end"
                            fontSize="10"
                            fontFamily="Red Hat Mono"
                            fill="#4B5E63"
                          >
                            {val >= 0 ? `+${val}%` : `${val}%`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Developer Paths */}
                    {normalizedData.map((d) => {
                      const pts = d.series.map((val, idx) => {
                        const x = pL + (idx / (d.series.length - 1)) * cw;
                        const y = pT + ch - ((val - minP) / pRange) * ch;
                        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                      }).join(' ');

                      const isSelected = developer.id === d.id;

                      return (
                        <g key={d.id}>
                          <path
                            d={pts}
                            fill="none"
                            stroke={d.color}
                            strokeWidth={isSelected ? '3' : '1.8'}
                            strokeOpacity={isSelected ? '1' : '0.7'}
                          />
                          {/* Final point circle */}
                          <circle
                            cx={pL + cw}
                            cy={pT + ch - ((d.finalPct - minP) / pRange) * ch}
                            r={isSelected ? '5' : '3.5'}
                            fill={d.color}
                            stroke="#fff"
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Financial Solvency & Handover Reliability Matrix */}
        <section
          aria-label="Developer solvency matrix"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1 pb-4 border-b border-[#D0DDD7]">
            <span className="text-xs uppercase font-bold text-[#0F4C5C] tracking-wider">
              Solvency &amp; Execution Rigor
            </span>
            <h2 className="font-['Montserrat'] text-xl sm:text-2xl font-bold text-[#152226]">
              Developer Financial Solvency &amp; RERA Delivery Health
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5E63]">
              Independently cross-checked against MCA registry, quarterly balance sheets, and state RERA databases.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D0DDD7] bg-[#F9FBFA] text-[#4B5E63]">
                  <th className="py-3 px-4 font-bold">Developer</th>
                  <th className="py-3 px-4 font-bold">Net Debt / Equity</th>
                  <th className="py-3 px-4 font-bold">Operating Margin</th>
                  <th className="py-3 px-4 font-bold">On-Time Handover</th>
                  <th className="py-3 px-4 font-bold">RERA Resolution</th>
                  <th className="py-3 px-4 font-bold">Solvency Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0DDD7]/60">
                {[
                  {
                    name: 'Sobha Limited',
                    debtEquity: '0.42x',
                    margin: '22.4%',
                    handover: '96.2%',
                    reraClear: '99.1%',
                    rating: '9.4 / 10',
                  },
                  {
                    name: 'DLF Limited',
                    debtEquity: '0.08x (Net Cash)',
                    margin: '34.8%',
                    handover: '98.5%',
                    reraClear: '99.8%',
                    rating: '9.5 / 10',
                  },
                  {
                    name: 'Prestige Estates',
                    debtEquity: '0.58x',
                    margin: '24.1%',
                    handover: '94.8%',
                    reraClear: '98.6%',
                    rating: '9.2 / 10',
                  },
                  {
                    name: 'Brigade Enterprises',
                    debtEquity: '0.49x',
                    margin: '21.0%',
                    handover: '93.5%',
                    reraClear: '98.2%',
                    rating: '9.0 / 10',
                  },
                  {
                    name: 'Godrej Properties',
                    debtEquity: '0.36x',
                    margin: '20.5%',
                    handover: '92.0%',
                    reraClear: '97.8%',
                    rating: '8.9 / 10',
                  },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-[#F2F5F3] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#152226]">{row.name}</td>
                    <td className="py-3.5 px-4 font-['Red_Hat_Mono'] text-[#152226] tabular-nums">
                      {row.debtEquity}
                    </td>
                    <td className="py-3.5 px-4 font-['Red_Hat_Mono'] font-bold text-[#1F7A4C] tabular-nums">
                      {row.margin}
                    </td>
                    <td className="py-3.5 px-4 font-['Red_Hat_Mono'] text-[#152226] tabular-nums">
                      <div className="flex items-center gap-2">
                        <span>{row.handover}</span>
                        <div className="w-16 h-1.5 rounded-full bg-[#E9EFEA] overflow-hidden">
                          <div
                            className="bg-[#0F4C5C] h-full"
                            style={{ width: row.handover }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-['Red_Hat_Mono'] text-[#14532D] tabular-nums">
                      {row.reraClear}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#14532D] font-['Red_Hat_Mono'] font-bold">
                        {row.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
