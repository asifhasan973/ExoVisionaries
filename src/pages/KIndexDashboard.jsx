import { useEffect, useState, useMemo } from "react";
const getSpaceMood = (value) => {
    if (value <= 2) return {
        mood: "Sleepy",
        emoji: "😴",
        color: "text-green-400",
        bgColor: "bg-green-500/20 border-green-500/30",
        description: "The Sun is taking a nap! No big space storms today.",
        activity: "Very Calm",
        character: "🌙",
        message: "Perfect time to look at stars!"
    };
    if (value <= 4) return {
        mood: "Happy",
        emoji: "😊",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20 border-blue-500/30",
        description: "The Sun is in a good mood! Just gentle space breezes.",
        activity: "Calm",
        character: "☀️",
        message: "Great day for space adventures!"
    };
    if (value <= 6) return {
        mood: "Excited",
        emoji: "🤩",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20 border-yellow-500/30",
        description: "The Sun is getting excited! Some space fireworks might happen!",
        activity: "Active",
        character: "⭐",
        message: "Look for auroras in the sky!"
    };
    if (value <= 8) return {
        mood: "Wild",
        emoji: "🌪️",
        color: "text-orange-400",
        bgColor: "bg-orange-500/20 border-orange-500/30",
        description: "The Sun is having a tantrum! Big space storms are happening!",
        activity: "Very Active",
        character: "⚡",
        message: "Stay inside and watch the show!"
    };
    return {
        mood: "Angry",
        emoji: "😡",
        color: "text-red-400",
        bgColor: "bg-red-500/20 border-red-500/30",
        description: "The Sun is super angry! Huge space storms everywhere!",
        activity: "Extreme",
        character: "🌋",
        message: "The Sun is very upset today!"
    };
};

export default function KIndexDashboard() {
    const [kIndexData, setKIndexData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const API_URL = "https://services.swpc.noaa.gov/json/boulder_k_index_1m.json";

    const fetchKIndexData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL, {
                cache: "no-store",
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Process the data
            const processedData = data
                .map(item => ({
                    time: new Date(item.time_tag),
                    kIndex: Number(item.k_index)
                }))
                .filter(item => !isNaN(item.kIndex) && item.time.toString() !== "Invalid Date")
                .sort((a, b) => a.time - b.time);

            setChartData(processedData);

            // Get the latest data point
            const latest = processedData[processedData.length - 1];
            if (latest) {
                const spaceMood = getSpaceMood(latest.kIndex);
                setKIndexData({
                    current: latest.kIndex,
                    max: 9,
                    status: spaceMood.mood,
                    description: spaceMood.description,
                    lastUpdated: new Date().toLocaleString('en-GB', {
                        hour12: false,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }) + ' GMT',
                    emoji: spaceMood.emoji,
                    activity: spaceMood.activity
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKIndexData();

        // Auto-refresh every 2 minutes
        const interval = setInterval(() => {
            if (autoRefresh) {
                fetchKIndexData();
            }
        }, 120000); // 2 minutes

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const spaceMood = kIndexData ? getSpaceMood(kIndexData.current) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
            {/* Animated stars background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 pt-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                            🌟 Space Weather Station 🌟
                        </span>
                    </h1>
                    <p className="text-2xl text-blue-200 max-w-4xl mx-auto font-semibold">
                        Discover what the Sun is doing in space now!
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Current Space Mood Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                            <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                                <span className="text-4xl">{spaceMood?.character || "🌍"}</span>
                                Current Space Mood
                            </h2>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-yellow-400 mb-4"></div>
                                    <p className="text-xl text-yellow-200">Loading space data...</p>
                                </div>
                            ) : kIndexData && spaceMood ? (
                                <div className="text-center">
                                    <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full border-4 ${spaceMood.bgColor} mb-8`}>
                                        <span className="text-8xl">{spaceMood.emoji}</span>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className={`text-4xl font-bold ${spaceMood.color} mb-4`}>
                                            {spaceMood.mood} Sun!
                                        </h3>
                                        <p className="text-2xl text-blue-200 font-semibold">
                                            {spaceMood.description}
                                        </p>
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                            <p className="text-xl text-yellow-200 font-bold">
                                                {spaceMood.message}
                                            </p>
                                        </div>
                                        <p className="text-lg text-gray-300">
                                            Data from: {kIndexData.lastUpdated}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-red-400">
                                    <p className="text-2xl">🚫 Unable to load space data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fun Info Panels */}
                    <div className="space-y-6">
                        {/* Space Mood Scale */}
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 text-center">🌌 Space Mood Scale</h3>
                            <div className="space-y-4">
                                {[
                                    { range: "0-2", level: "Sleepy", emoji: "😴", color: "text-green-400", desc: "Sun is napping" },
                                    { range: "3-4", level: "Happy", emoji: "😊", color: "text-blue-400", desc: "Sun is happy" },
                                    { range: "5-6", level: "Excited", emoji: "🤩", color: "text-yellow-400", desc: "Sun is excited" },
                                    { range: "7-8", level: "Wild", emoji: "🌪️", color: "text-orange-400", desc: "Sun is wild" },
                                    { range: "9", level: "Angry", emoji: "😡", color: "text-red-400", desc: "Sun is angry" }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{item.emoji}</span>
                                            <span className={`font-bold ${item.color}`}>{item.level}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-300">{item.range}</div>
                                            <div className="text-xs text-gray-400">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fun Facts */}
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 text-center">🚀 Fun Space Facts</h3>
                            <div className="space-y-4 text-sm">
                                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-4">
                                    <p className="font-semibold text-pink-200">Did you know?</p>
                                    <p className="text-gray-200">The Sun is like a giant magnet that protects Earth!</p>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4">
                                    <p className="font-semibold text-blue-200">Cool fact!</p>
                                    <p className="text-gray-200">When the Sun is excited, we can see beautiful auroras!</p>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4">
                                    <p className="font-semibold text-yellow-200">Amazing!</p>
                                    <p className="text-gray-200">Space weather affects satellites and astronauts!</p>
                                </div>
                            </div>
                        </div>

                        {/* Today's Space Stats */}
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 text-center">📊 Today's Space Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                                    <span className="text-gray-300">Highest Mood</span>
                                    <span className="text-2xl">😊</span>
                                    <span className="text-green-400 font-bold">Happy</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                                    <span className="text-gray-300">Lowest Mood</span>
                                    <span className="text-2xl">😴</span>
                                    <span className="text-blue-400 font-bold">Sleepy</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                                    <span className="text-gray-300">Average Mood</span>
                                    <span className="text-2xl">😊</span>
                                    <span className="text-yellow-400 font-bold">Happy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Chart Section */}
                <div className="mt-12">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-3xl font-bold text-center text-yellow-300 flex items-center gap-3">
                                📈 Live Space Weather Chart
                            </h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${autoRefresh
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-500 text-gray-200'
                                        }`}
                                >
                                    {autoRefresh ? '🔄 Auto-Update ON' : '⏸️ Auto-Update OFF'}
                                </button>
                                <button
                                    onClick={fetchKIndexData}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    🔄 Refresh Now
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">😞</div>
                                <p className="text-xl text-red-400 mb-2">Oops! Couldn't load space data</p>
                                <p className="text-gray-400">Error: {error}</p>
                                <button
                                    onClick={fetchKIndexData}
                                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <KIndexChart data={chartData} loading={loading} />
                                <div className="mt-4 text-center text-sm text-gray-300">
                                    <p>📊 Showing the last {chartData.length} data points from <a href="https://services.swpc.noaa.gov/json/boulder_k_index_1m.json" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">NOAA Space Weather Prediction Center</a></p>
                                    <p className="mt-1">🕐 Data updates every minute • Last data: {kIndexData ? kIndexData.lastUpdated : 'Loading...'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Educational Section */}
                <div className="mt-12">
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                        <h3 className="text-3xl font-bold mb-6 text-center text-yellow-300">🌟 What is Space Weather?</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xl font-bold mb-4 text-cyan-300">🌞 The Sun's Mood</h4>
                                <p className="text-lg text-gray-200 leading-relaxed">
                                    Just like you have different moods, the Sun has moods too! Sometimes it's calm and peaceful,
                                    and sometimes it gets excited and sends out big bursts of energy called solar storms.
                                    We measure this with something called the K-Index!
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-4 text-pink-300">🌈 Why It Matters</h4>
                                <p className="text-lg text-gray-200 leading-relaxed">
                                    When the Sun is excited, it creates beautiful light shows called auroras (like the Northern Lights)!
                                    But it can also affect our technology. That's why scientists watch the Sun's mood very carefully
                                    to keep everyone safe!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Elements */}
                <div className="mt-8 text-center">
                    <button
                        className="bg-gradient-to-r from-yellow-400 to-pink-400 text-black font-bold py-4 px-8 rounded-2xl text-xl hover:scale-105 transition-transform duration-200 shadow-2xl"
                        onClick={() => window.location.reload()}
                    >
                        🔄 Check Space Weather Again!
                    </button>
                </div>
            </div>
        </div>
    );
}

// Kid-friendly K-Index Chart Component
function KIndexChart({ data, loading }) {
    const chartHeight = 300;
    const padding = 40;
    const plotHeight = chartHeight - 2 * padding;

    // Make chart width responsive and scrollable
    const minChartWidth = 800;
    const dataPoints = data ? data.length : 0;
    const chartWidth = Math.max(minChartWidth, dataPoints * 8); // 8px per data point minimum
    const plotWidth = chartWidth - 2 * padding;

    // Calculate chart dimensions and scales
    const chartInfo = useMemo(() => {
        if (!data || data.length === 0) {
            return { points: [], minK: 0, maxK: 9, timeRange: null };
        }

        const kValues = data.map(d => d.kIndex);
        const times = data.map(d => d.time.getTime());

        const minK = Math.max(0, Math.floor(Math.min(...kValues)));
        const maxK = Math.min(9, Math.ceil(Math.max(...kValues)));
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        const scaleX = (time) => padding + ((time - minTime) / (maxTime - minTime)) * plotWidth;
        const scaleY = (k) => padding + plotHeight - ((k - minK) / (maxK - minK)) * plotHeight;

        const points = data.map(d => `${scaleX(d.time.getTime())},${scaleY(d.kIndex)}`).join(' ');

        return {
            points,
            minK,
            maxK,
            timeRange: { min: new Date(minTime), max: new Date(maxTime) },
            scaleX,
            scaleY
        };
    }, [data]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
                    <p className="text-xl text-yellow-200">Loading space data from the Sun... 🌞</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl text-gray-300">No space weather data available</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="overflow-x-auto overflow-y-hidden">
                    <svg width={chartWidth} height={chartHeight} className="h-auto" style={{ minWidth: '100%' }}>
                        {/* Background */}
                        <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="rgba(15, 23, 42, 0.8)" />

                        {/* Main grid lines */}
                        {[0, 2, 4, 6, 8].map(k => (
                            <g key={k}>
                                <line
                                    x1={padding}
                                    y1={chartInfo.scaleY ? chartInfo.scaleY(k) : 0}
                                    x2={chartWidth - padding}
                                    y2={chartInfo.scaleY ? chartInfo.scaleY(k) : 0}
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="1"
                                    strokeDasharray="3,6"
                                />
                                <text
                                    x={padding - 15}
                                    y={chartInfo.scaleY ? chartInfo.scaleY(k) + 5 : 0}
                                    fontSize="14"
                                    fill="#e2e8f0"
                                    textAnchor="end"
                                    fontWeight="600"
                                >
                                    K{k}
                                </text>
                            </g>
                        ))}

                        {/* Minor grid lines */}
                        {[1, 3, 5, 7].map(k => (
                            <g key={`minor-${k}`}>
                                <line
                                    x1={padding}
                                    y1={chartInfo.scaleY ? chartInfo.scaleY(k) : 0}
                                    x2={chartWidth - padding}
                                    y2={chartInfo.scaleY ? chartInfo.scaleY(k) : 0}
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="0.5"
                                    strokeDasharray="1,3"
                                />
                            </g>
                        ))}

                        {/* Color-coded background bands */}
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(2) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(0) - chartInfo.scaleY(2) : 0}
                            fill="rgba(34, 197, 94, 0.15)"
                            stroke="rgba(34, 197, 94, 0.3)"
                            strokeWidth="1"
                        />
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(4) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(2) - chartInfo.scaleY(4) : 0}
                            fill="rgba(59, 130, 246, 0.15)"
                            stroke="rgba(59, 130, 246, 0.3)"
                            strokeWidth="1"
                        />
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(6) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(4) - chartInfo.scaleY(6) : 0}
                            fill="rgba(251, 191, 36, 0.15)"
                            stroke="rgba(251, 191, 36, 0.3)"
                            strokeWidth="1"
                        />
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(8) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(6) - chartInfo.scaleY(8) : 0}
                            fill="rgba(249, 115, 22, 0.15)"
                            stroke="rgba(249, 115, 22, 0.3)"
                            strokeWidth="1"
                        />
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(9) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(8) - chartInfo.scaleY(9) : 0}
                            fill="rgba(239, 68, 68, 0.15)"
                            stroke="rgba(239, 68, 68, 0.3)"
                            strokeWidth="1"
                        />

                        {/* Chart line */}
                        <polyline
                            points={chartInfo.points}
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="drop-shadow(0 0 6px rgba(34, 211, 238, 0.3))"
                        />

                        {/* Time labels on x-axis */}
                        {data && data.length > 0 && (
                            <>
                                <text
                                    x={padding}
                                    y={chartHeight - 10}
                                    fontSize="12"
                                    fill="#94a3b8"
                                    textAnchor="start"
                                >
                                    {new Date().toLocaleTimeString('en-GB', {
                                        hour12: false,
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) + ' GMT'}
                                </text>
                                <text
                                    x={chartWidth - padding}
                                    y={chartHeight - 10}
                                    fontSize="12"
                                    fill="#94a3b8"
                                    textAnchor="end"
                                >
                                    {new Date().toLocaleTimeString('en-GB', {
                                        hour12: false,
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) + ' GMT'}
                                </text>
                            </>
                        )}

                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="25%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#fbbf24" />
                                <stop offset="75%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                        </defs>

                        {/* Data points */}
                        {data.map((point, index) => {
                            const x = chartInfo.scaleX ? chartInfo.scaleX(point.time.getTime()) : 0;
                            const y = chartInfo.scaleY ? chartInfo.scaleY(point.kIndex) : 0;
                            const mood = getSpaceMood(point.kIndex);

                            // Convert Tailwind color classes to hex values
                            const getColorHex = (colorClass) => {
                                switch (colorClass) {
                                    case 'text-green-400': return '#4ade80';
                                    case 'text-blue-400': return '#60a5fa';
                                    case 'text-yellow-400': return '#facc15';
                                    case 'text-orange-400': return '#fb923c';
                                    case 'text-red-400': return '#f87171';
                                    default: return '#60a5fa';
                                }
                            };

                            return (
                                <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill={getColorHex(mood.color)}
                                    stroke="white"
                                    strokeWidth="2"
                                    className="hover:r-6 transition-all duration-200"
                                >
                                    <title>{`${new Date().toLocaleTimeString('en-GB', {
                                        hour12: false,
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })} GMT: K-Index ${point.kIndex.toFixed(1)} (${mood.mood})`}</title>
                                </circle>
                            );
                        })}

                        {/* Latest point highlight */}
                        {data.length > 0 && (
                            <circle
                                cx={chartInfo.scaleX ? chartInfo.scaleX(data[data.length - 1].time.getTime()) : 0}
                                cy={chartInfo.scaleY ? chartInfo.scaleY(data[data.length - 1].kIndex) : 0}
                                r="8"
                                fill="white"
                                stroke="#fbbf24"
                                strokeWidth="3"
                            />
                        )}
                    </svg>
                </div>

                {/* Scroll indicator */}
                {chartWidth > 800 && (
                    <div className="mt-2 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                            <span>👈</span>
                            <span>Scroll horizontally to see more data</span>
                            <span>👉</span>
                        </div>
                    </div>
                )}

                {/* Chart legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-gray-300">😴 Sleepy (0-2)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-gray-300">😊 Happy (3-4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-300">🤩 Excited (5-6)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span className="text-gray-300">🌪️ Wild (7-8)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-gray-300">😡 Angry (9)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}