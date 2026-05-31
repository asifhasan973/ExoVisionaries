import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Earth3D from "../components/Earth3D";

const DATA_URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json";
const OFFICIAL_PAGE = "https://www.swpc.noaa.gov/products/aurora-30-minute-forecast";

function colorFor(v) {
    const t = Math.max(0, Math.min(1, v / 100));
    const stops = [
        [0, 18, 46],
        [0, 92, 92],
        [2, 129, 64],
        [142, 192, 14],
        [241, 199, 0],
        [234, 128, 0],
        [210, 30, 42],
        [178, 36, 180]
    ];
    const x = t * (stops.length - 1);
    const i = Math.floor(x);
    const f = x - i;
    const a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
    const r = Math.round(a[0] + (b[0] - a[0]) * f);
    const g = Math.round(a[1] + (b[1] - a[1]) * f);
    const bch = Math.round(a[2] + (b[2] - a[2]) * f);
    return `rgb(${r},${g},${bch})`;
}

function formatUTC(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.toUTCString().replace("GMT", "UTC")}`;
}

export default function AuroraForecast() {
    const [meta, setMeta] = useState({ obs: "", fcst: "", format: "" });
    const [grid, setGrid] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [opacity, setOpacity] = useState(0.9);
    const [maxCap, setMaxCap] = useState(100);
    const [showGraticule, setShowGraticule] = useState(true);
    const [tooltipTick, setTooltipTick] = useState(0);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [viewMode, setViewMode] = useState('3d');
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [northImages, setNorthImages] = useState([]);
    const [southImages, setSouthImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(200);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState("");
    const intervalRef = useRef(null);

    const canvasRef = useRef(null);
    const hoverRef = useRef({ lon: null, lat: null, val: null });
    const buildIndexRef = useRef(null);
    const navigate = useNavigate();

    const dims = useResponsiveDims();

    // Video player functions
    const fetchVideoData = async () => {
        try {
            setVideoLoading(true);
            setVideoError("");
            const [northResponse, southResponse] = await Promise.all([
                fetch('https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json'),
                fetch('https://services.swpc.noaa.gov/products/animations/ovation_south_24h.json')
            ]);

            if (!northResponse.ok || !southResponse.ok) {
                throw new Error("Could not load aurora animation data from NOAA");
            }

            const northData = await northResponse.json();
            const southData = await southResponse.json();

            setNorthImages(northData.reverse());
            setSouthImages(southData.reverse());
        } catch (error) {
            setVideoError(error?.message || "Failed to load aurora animations");
        } finally {
            setVideoLoading(false);
        }
    };

    const toggleVideoPlayPause = () => {
        if (isPlaying) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            const maxLength = Math.max(northImages.length, southImages.length);
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    return (prevIndex + 1) % maxLength;
                });
            }, playbackSpeed);
        }
    };

    const resetVideo = () => {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        setCurrentIndex(0);
    };

    const handleVideoSpeedChange = (e) => {
        const newSpeed = parseInt(e.target.value);
        setPlaybackSpeed(newSpeed);

        if (isPlaying) {
            clearInterval(intervalRef.current);
            const maxLength = Math.max(northImages.length, southImages.length);
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    return (prevIndex + 1) % maxLength;
                });
            }, newSpeed);
        }
    };

    // Helper function to normalize longitude
    function normalizeLon(lon) {
        // handle 0..359 → convert to -180..179 range
        if (lon >= 0 && lon <= 359) {
            const l = lon > 180 ? lon - 360 : lon;
            return l;
        }
        return ((lon + 180) % 360) - 180;
    }

    // Build spatial index for fast lookup
    function buildIndex(coords) {
        const idx = new Map();
        for (let i = 0; i < coords.length; i++) {
            const [rawLon, lat, val] = coords[i];
            const lon = normalizeLon(rawLon);
            const key1 = `${lon}|${lat}`;
            const key2 = `${rawLon}|${lat}`;
            idx.set(key1, coords[i]);
            idx.set(key2, coords[i]);
        }
        return idx;
    }

    // Draw heatmap function
    function drawHeatmap(canvas, coords, { width, height, opacity, maxCap, graticule, bgImage }) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);

        // draw background image if available
        if (bgImage) {
            ctx.globalAlpha = 0.8;
            ctx.drawImage(bgImage, 0, 0, width, height);
            ctx.globalAlpha = 1;
        } else {
            // fallback to faint ocean fill
            ctx.fillStyle = "#e6f0ff";
            ctx.globalAlpha = 1;
            ctx.fillRect(0, 0, width, height);
        }

        // draw graticule (every 30° lon, 15° lat)
        if (graticule) {
            ctx.strokeStyle = "rgba(0,0,0,0.08)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let lon = -180; lon <= 180; lon += 30) {
                const x = ((lon + 180) / 360) * width;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let lat = -90; lat <= 90; lat += 15) {
                const y = ((90 - lat) / 180) * height;
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();
        }

        // draw heat tiles
        const tileW = Math.max(1, Math.floor(width / 360));  // ~1° lon
        const tileH = Math.max(1, Math.floor(height / 180)); // ~1° lat
        ctx.globalAlpha = opacity;

        for (let i = 0; i < coords.length; i++) {
            const [rawLon, lat, valRaw] = coords[i];
            const v = Math.min(maxCap, Math.max(0, valRaw)); // cap/crop
            if (v <= 0) continue;

            // normalize lon from dataset (either 0..359 or -180..179)
            const lon = normalizeLon(rawLon);
            const x = Math.floor(((lon + 180) / 360) * width);
            const y = Math.floor(((90 - lat) / 180) * height);

            ctx.fillStyle = colorFor((v / maxCap) * 100);
            ctx.fillRect(x, y, tileW, tileH);
        }

        ctx.globalAlpha = 1;
        // draw polar hints
        drawPolarCaps(ctx, width, height);
    }

    // Draw polar caps function
    function drawPolarCaps(ctx, w, h) {
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.setLineDash([4, 4]);
        const yN = Math.floor(((90 - 67) / 180) * h);  // ~auroral oval belt hint
        const yS = Math.floor(((90 - (-67)) / 180) * h);
        ctx.beginPath();
        ctx.moveTo(0, yN); ctx.lineTo(w, yN);
        ctx.moveTo(0, yS); ctx.lineTo(w, yS);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Data fetching function
    const fetchAuroraData = async () => {
        setLoading(true);
        setErr("");
        try {
            const response = await fetch(DATA_URL, { cache: "no-store" });
            const data = await response.json();
            const coords = Array.isArray(data.coordinates) ? data.coordinates : [];
            setGrid(coords);
            setMeta({
                obs: data["Observation Time"] || "",
                fcst: data["Forecast Time"] || "",
                format: data["Data Format"] || "",
            });
        } catch (error) {
            setErr(error?.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    // Load background image
    useEffect(() => {
        const img = new Image();
        img.onload = () => setBackgroundImage(img);
        img.onerror = () => {};
        img.src = "https://img.freepik.com/free-vector/top-view-world-map-background_1308-68322.jpg?semt=ais_hybrid&w=740&q=80";
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchAuroraData();
    }, []);

    // Auto-refresh when switching to Flat Earth view
    useEffect(() => {
        if (viewMode === 'flat') {
            fetchAuroraData();
        }
    }, [viewMode]);

    // Cleanup video interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current || !grid.length) return;
        drawHeatmap(canvasRef.current, grid, {
            width: dims.width,
            height: dims.height,
            opacity,
            maxCap,
            graticule: showGraticule,
            bgImage: backgroundImage,
        });
    }, [grid, dims, opacity, maxCap, showGraticule, backgroundImage]);

    function handleMouseMove(e) {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const lon = Math.round((x / rect.width) * 360 - 180);
        const lat = Math.round(90 - (y / rect.height) * 180);

        // find nearest cell (dataset has lon as 0..359 or -180..179; handle both)
        const normLon = ((lon % 360) + 360) % 360;
        let nearest = null;
        // quick heuristic: search small neighborhood by hashing lon/lat into a map
        // build index once
        const idx = buildIndexRef.current || buildIndex(grid);
        buildIndexRef.current = idx;

        const key1 = `${normLon}|${lat}`;
        const key2 = `${lon}|${lat}`;
        nearest = idx.get(key1) ?? idx.get(key2);

        hoverRef.current = {
            lon,
            lat,
            val: nearest?.[2] ?? null,
        };
        // force tooltip redraw by toggling state via noop setter
        setTooltipTick((t) => t + 1);
    }

    function handleMouseLeave() {
        hoverRef.current = { lon: null, lat: null, val: null };
        setTooltipTick((t) => t + 1);
    }

    const hover = hoverRef.current;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"></div>
                <div className="relative z-10 container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Aurora Forecast
                            </h1>
                            <p className="text-cyan-300 text-sm">
                                Real-time aurora predictions from NOAA SWPC
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* View Toggle */}
                            <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                                <button
                                    onClick={() => setViewMode('3d')}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${viewMode === '3d'
                                        ? 'bg-white/20 text-white shadow-lg'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    3D View
                                </button>
                                <button
                                    onClick={() => setViewMode('flat')}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${viewMode === 'flat'
                                        ? 'bg-white/20 text-white shadow-lg'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    Flat Earth
                                </button>
                            </div>

                            {/* Video Player Toggle */}

                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl">

                    {/* Controls - Only show in flat earth view */}
                    {viewMode === 'flat' && (
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => window.open(OFFICIAL_PAGE, "_blank", "noopener")}
                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-semibold"
                                    >
                                        Open Official Page ↗
                                    </button>
                                    <button
                                        onClick={fetchAuroraData}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
                                    >
                                        Refresh Data
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-4 items-center">
                                    <label className="text-white text-sm">
                                        Opacity
                                        <input
                                            type="range"
                                            min={0.3}
                                            max={1}
                                            step={0.05}
                                            value={opacity}
                                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                            className="ml-2 w-24"
                                        />
                                    </label>
                                    <label className="text-white text-sm">
                                        Cap max (%)
                                        <input
                                            type="range"
                                            min={20}
                                            max={100}
                                            step={5}
                                            value={maxCap}
                                            onChange={(e) => setMaxCap(parseInt(e.target.value))}
                                            className="ml-2 w-24"
                                        />
                                    </label>
                                    <label className="text-white text-sm flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={showGraticule}
                                            onChange={(e) => setShowGraticule(e.target.checked)}
                                            className="rounded"
                                        />
                                        Grid lines
                                    </label>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-cyan-300 text-xs font-semibold mb-1">Observation Time (UTC)</div>
                                    <div className="text-white text-sm">{formatUTC(meta.obs)}</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-cyan-300 text-xs font-semibold mb-1">Forecast Time (UTC)</div>
                                    <div className="text-white text-sm">{formatUTC(meta.fcst)}</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                    <div className="text-cyan-300 text-xs font-semibold mb-1">Data Format</div>
                                    <div className="text-white text-sm">{meta.format || "[Longitude, Latitude, Value]"}</div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Canvas Container */}
                    <div className="relative bg-white/5 rounded-lg p-4">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
                                <div className="text-center">
                                    <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-cyan-400 font-semibold">Loading latest aurora data...</p>
                                </div>
                            </div>
                        )}

                        {err && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 rounded-lg z-10">
                                <div className="text-center">
                                    <p className="text-red-400 font-semibold mb-4">Error: {err}</p>
                                    <button
                                        onClick={fetchAuroraData}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            {viewMode === '3d' ? (
                                <Earth3D
                                    auroraData={grid}
                                    opacity={opacity}
                                    maxCap={maxCap}
                                    width={dims.width}
                                    height={dims.height}
                                />
                            ) : (
                                <>
                                    <canvas
                                        ref={canvasRef}
                                        width={dims.width}
                                        height={dims.height}
                                        className="w-full h-auto block rounded-lg border border-white/20"
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                    <Legend />
                                    <Tooltip hover={hover} />
                                </>
                            )}
                        </div>

                        {/* Video Player Section */}
                        {viewMode === 'flat' && showVideoPlayer && (
                            <div className="mt-8 bg-white/5 rounded-lg p-6 border border-white/20">
                                <h3 className="text-xl font-semibold text-white mb-4 text-center">
                                    Aurora Animation Player - Last 24 Hours
                                </h3>

                                {videoError && (
                                    <div className="mb-4 text-center py-4 px-4 rounded-lg bg-red-900/40 border border-red-500/30">
                                        <p className="text-red-300 font-medium mb-3">{videoError}</p>
                                        <button
                                            onClick={fetchVideoData}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Northern Hemisphere Video */}
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-medium text-cyan-300 text-center">Northern Hemisphere</h4>
                                        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                                            {videoLoading ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center">
                                                        <img
                                                            src="https://services.swpc.noaa.gov/images/animations/ovation/north/latest.jpg"
                                                            alt="Loading Northern Aurora"
                                                            className="w-full h-full object-contain"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                                            <div className="text-white">Loading Northern Data...</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : northImages.length > 0 ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={`https://services.swpc.noaa.gov${northImages[currentIndex]?.url}`}
                                                        alt={`Northern Aurora - ${northImages[currentIndex]?.time_tag}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                                        {northImages[currentIndex]?.time_tag ?
                                                            new Date(northImages[currentIndex].time_tag).toLocaleString() :
                                                            'Loading...'
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-white">
                                                    No Northern data available
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Southern Hemisphere Video */}
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-medium text-cyan-300 text-center">Southern Hemisphere</h4>
                                        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                                            {videoLoading ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center">
                                                        <img
                                                            src="https://services.swpc.noaa.gov/images/animations/ovation/south/latest.jpg"
                                                            alt="Loading Southern Aurora"
                                                            className="w-full h-full object-contain"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                                            <div className="text-white">Loading Southern Data...</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : southImages.length > 0 ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={`https://services.swpc.noaa.gov${southImages[currentIndex]?.url}`}
                                                        alt={`Southern Aurora - ${southImages[currentIndex]?.time_tag}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                                        {southImages[currentIndex]?.time_tag ?
                                                            new Date(southImages[currentIndex].time_tag).toLocaleString() :
                                                            'Loading...'
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-white">
                                                    No Southern data available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Video Controls */}
                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={toggleVideoPlayPause}
                                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${isPlaying
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                            disabled={videoLoading || (northImages.length === 0 && southImages.length === 0)}
                                        >
                                            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                                        </button>

                                        <button
                                            onClick={resetVideo}
                                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                            disabled={videoLoading || (northImages.length === 0 && southImages.length === 0)}
                                        >
                                            🔄 Reset
                                        </button>
                                    </div>

                                    <div className="max-w-md mx-auto">
                                        <label className="block text-white text-sm font-medium mb-2 text-center">
                                            Playback Speed: {playbackSpeed}ms per frame
                                        </label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="1000"
                                            step="50"
                                            value={playbackSpeed}
                                            onChange={handleVideoSpeedChange}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Fast (50ms)</span>
                                            <span>Slow (1000ms)</span>
                                        </div>
                                    </div>

                                    {(northImages.length > 0 || southImages.length > 0) && (
                                        <div className="text-center text-gray-400 text-sm">
                                            <p>📊 Showing recent to historical data • Updates every 5 minutes</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 text-center">
                        <p className="text-white/70 text-sm leading-relaxed">
                            This visualization uses NOAA SWPC's OVATION aurora grid (0–100 probability).
                            Projection is equirectangular (lon −180→+180, lat −90→+90).
                            NASA does not endorse non-U.S. Government sites and users must respect each site's data rules.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----- helpers -----

function MetaRow({ label, value }) {
    return (
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#64748b", width: 200, minWidth: 160 }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
        </div>
    );
}

function Legend() {
    const steps = 8;
    const swatches = new Array(steps).fill(0).map((_, i) => Math.round((i / (steps - 1)) * 100));
    return (
        <div className="absolute left-3 bottom-3 bg-white/90 backdrop-blur-sm border border-white/20 p-2 rounded-lg shadow-lg">
            <div className="flex gap-0">
                {swatches.map((v, i) => (
                    <div
                        key={i}
                        className="w-6 h-3"
                        style={{
                            background: colorFor(v),
                            borderRadius: i === 0 ? "6px 0 0 6px" : i === swatches.length - 1 ? "0 6px 6px 0" : 0
                        }}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0%</span><span>50%</span><span>100%</span>
            </div>
        </div>
    );
}

function Tooltip({ hover }) {
    const showing = hover && hover.lon !== null && hover.lat !== null;
    if (!showing) return null;
    return (
        <div className="absolute right-3 top-3 bg-gray-900/85 text-white text-xs p-2 rounded-lg backdrop-blur-sm shadow-lg">
            <div className="font-bold mb-1">Cursor</div>
            <div>Lon: {hover.lon}°, Lat: {hover.lat}°</div>
            <div>Prob: {hover.val == null ? "—" : `${hover.val}%`}</div>
        </div>
    );
}


// responsive canvas: fill container width, maintain 2:1 aspect (world map)
function useResponsiveDims() {
    const [dims, setDims] = useState({ width: 1000, height: 500 });
    const containerRef = useRef(null);

    useEffect(() => {
        function onResize() {
            const el = containerRef.current?.parentElement || document.body;
            const w = Math.min(1200, el.clientWidth - 2 * 16); // container padding guess
            const width = Math.max(320, w);
            const height = Math.round(width / 2); // 2:1
            setDims({ width, height });
        }
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // attach a hidden sentinel div so parent width is measured
    return useMemo(() => {
        const sentinel = (
            <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0 }} />
        );
        return Object.assign({ width: dims.width, height: dims.height }, { sentinel });
    }, [dims]);
}