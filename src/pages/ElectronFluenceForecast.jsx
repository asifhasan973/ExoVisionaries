import { useEffect, useState, useMemo } from "react";
const getElectronStormLevel = (fluence) => {
    if (fluence < 10000000) return {
        level: "Calm",
        emoji: "😌",
        color: "text-green-400",
        bgColor: "bg-green-500/20 border-green-500/30",
        description: "Electrons are peacefully floating around!",
        activity: "Very Low",
        character: "🌙",
        message: "Perfect time for satellite operations!"
    };
    if (fluence < 50000000) return {
        level: "Gentle",
        emoji: "😊",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20 border-blue-500/30",
        description: "Electrons are having a gentle dance in space!",
        activity: "Low",
        character: "☀️",
        message: "Space is calm and peaceful!"
    };
    if (fluence < 100000000) return {
        level: "Active",
        emoji: "🤩",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20 border-yellow-500/30",
        description: "Electrons are getting excited! Some space energy is building up!",
        activity: "Moderate",
        character: "⭐",
        message: "Watch out for some space fireworks!"
    };
    if (fluence < 500000000) return {
        level: "Stormy",
        emoji: "🌪️",
        color: "text-orange-400",
        bgColor: "bg-orange-500/20 border-orange-500/30",
        description: "Electrons are having a big party! Space storm is brewing!",
        activity: "High",
        character: "⚡",
        message: "Satellites need to be extra careful!"
    };
    return {
        level: "Extreme",
        emoji: "😡",
        color: "text-red-400",
        bgColor: "bg-red-500/20 border-red-500/30",
        description: "Electrons are going crazy! Huge space storm happening!",
        activity: "Extreme",
        character: "🌋",
        message: "Major space weather alert!"
    };
};

// Helper function to get solar wind speed level
const getSolarWindLevel = (speed) => {
    if (speed < 400) return { level: "Slow", emoji: "🐌", color: "text-blue-400" };
    if (speed < 500) return { level: "Normal", emoji: "🚶", color: "text-green-400" };
    if (speed < 600) return { level: "Fast", emoji: "🏃", color: "text-yellow-400" };
    return { level: "Very Fast", emoji: "🚀", color: "text-red-400" };
};

export default function ElectronFluenceForecast() {
    const [fluenceData, setFluenceData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const API_URL = "https://services.swpc.noaa.gov/json/electron_fluence_forecast.json";

    const fetchFluenceData = async () => {
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
                    date: new Date(item.date),
                    speed: Number(item.speed),
                    fluence: Number(item.fluence),
                    fluenceDayTwo: Number(item.fluence_day_two),
                    fluenceDayThree: Number(item.fluence_day_three),
                    fluenceDayFour: Number(item.fluence_day_four)
                }))
                .filter(item => !isNaN(item.fluence) && item.date.toString() !== "Invalid Date")
                .sort((a, b) => a.date - b.date);

            setChartData(processedData);

            // Get the latest data point
            const latest = processedData[processedData.length - 1];
            if (latest) {
                const electronStorm = getElectronStormLevel(latest.fluence);
                const solarWind = getSolarWindLevel(latest.speed);

                setFluenceData({
                    current: latest.fluence,
                    speed: latest.speed,
                    status: electronStorm.level,
                    description: electronStorm.description,
                    lastUpdated: latest.date.toLocaleDateString('en-GB', {
                        timeZone: 'GMT',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    emoji: electronStorm.emoji,
                    activity: electronStorm.activity,
                    solarWindLevel: solarWind.level,
                    solarWindEmoji: solarWind.emoji,
                    solarWindColor: solarWind.color,
                    forecast: {
                        dayTwo: latest.fluenceDayTwo,
                        dayThree: latest.fluenceDayThree,
                        dayFour: latest.fluenceDayFour
                    }
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFluenceData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(() => {
            if (autoRefresh) {
                fetchFluenceData();
            }
        }, 300000); // 5 minutes

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const electronStorm = fluenceData ? getElectronStormLevel(fluenceData.current) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-900 text-white">
            {/* Animated particles background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(60)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-300 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 3}s`
                        }}
                    />
                ))}
                {/* Floating electron particles */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={`electron-${i}`}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-60"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${4 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 pt-20">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12 px-4">
                    <div className="relative inline-block">
                        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-yellow-400 to-teal-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                        <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6">
                            <span className="bg-gradient-to-r from-cyan-300 via-yellow-300 to-teal-300 bg-clip-text text-transparent">
                                ⚡ Electron Storm Station ⚡
                            </span>
                        </h1>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl text-cyan-200 max-w-4xl mx-auto font-semibold">
                        Watch the electron particles dance in space!
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Current Electron Storm Card */}
                    <div className="lg:col-span-2 order-1 lg:order-1">
                        <div className="bg-gradient-to-br from-slate-800/30 via-cyan-900/20 to-teal-800/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center flex items-center justify-center gap-2 md:gap-3">
                                <span className="text-2xl sm:text-3xl md:text-4xl">{electronStorm?.character || "⚡"}</span>
                                <span className="hidden sm:inline">Current Electron Storm</span>
                                <span className="sm:hidden">Electron Storm</span>
                            </h2>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-48 md:h-64">
                                    <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-b-4 border-yellow-400 mb-4"></div>
                                    <p className="text-lg md:text-xl text-yellow-200">Loading electron data...</p>
                                </div>
                            ) : fluenceData && electronStorm ? (
                                <div className="text-center">
                                    <div className={`inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 ${electronStorm.bgColor} mb-4 md:mb-8`}>
                                        <span className="text-4xl sm:text-6xl md:text-8xl">{electronStorm.emoji}</span>
                                    </div>

                                    <div className="space-y-4 md:space-y-6">
                                        <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${electronStorm.color} mb-2 md:mb-4`}>
                                            {electronStorm.level} Electrons!
                                        </h3>
                                        <p className="text-lg sm:text-xl md:text-2xl text-cyan-200 font-semibold px-2">
                                            {electronStorm.description}
                                        </p>
                                        <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 border border-cyan-400/20">
                                            <p className="text-lg md:text-xl text-yellow-200 font-bold">
                                                {electronStorm.message}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm md:text-lg">
                                            <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-lg md:rounded-xl p-3 md:p-4 border border-cyan-400/20">
                                                <p className="text-cyan-300 text-xs md:text-sm">Electron Count</p>
                                                <p className="text-lg md:text-2xl font-bold text-cyan-200">
                                                    {fluenceData.current.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg md:rounded-xl p-3 md:p-4 border border-yellow-400/20">
                                                <p className="text-yellow-300 text-xs md:text-sm">Solar Wind Speed</p>
                                                <p className="text-lg md:text-2xl font-bold text-yellow-200">
                                                    {fluenceData.speed} km/s
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm md:text-lg text-gray-300">
                                            Data from: {fluenceData.lastUpdated}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-red-400">
                                    <p className="text-2xl">🚫 Unable to load electron data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Panels */}
                    <div className="space-y-4 md:space-y-6 order-2 lg:order-2">
                        {/* Electron Storm Scale */}
                        <div className="bg-gradient-to-br from-slate-800/30 via-cyan-900/20 to-teal-800/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
                            <h3 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-center">⚡ Electron Storm Scale</h3>
                            <div className="space-y-2 md:space-y-4">
                                {[
                                    { range: "&lt; 10M", level: "Calm", emoji: "😌", color: "text-green-400", desc: "Electrons are peaceful" },
                                    { range: "10M-50M", level: "Gentle", emoji: "😊", color: "text-blue-400", desc: "Electrons are dancing" },
                                    { range: "50M-100M", level: "Active", emoji: "🤩", color: "text-yellow-400", desc: "Electrons are excited" },
                                    { range: "100M-500M", level: "Stormy", emoji: "🌪️", color: "text-orange-400", desc: "Electrons are partying" },
                                    { range: "&gt; 500M", level: "Extreme", emoji: "😡", color: "text-red-400", desc: "Electrons are crazy" }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gradient-to-r from-slate-700/20 to-cyan-800/20 rounded-lg md:rounded-xl p-2 md:p-3 border border-cyan-400/10">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <span className="text-lg md:text-2xl">{item.emoji}</span>
                                            <span className={`font-bold text-sm md:text-base ${item.color}`}>{item.level}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs md:text-sm text-cyan-300">{item.range}</div>
                                            <div className="text-xs text-cyan-400 hidden sm:block">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Solar Wind Speed */}
                        <div className="bg-gradient-to-br from-slate-800/30 via-cyan-900/20 to-teal-800/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
                            <h3 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-center text-cyan-300">🌬️ Solar Wind Speed</h3>
                            {fluenceData ? (
                                <div className="text-center">
                                    <div className="text-4xl md:text-6xl mb-2 md:mb-4">{fluenceData.solarWindEmoji}</div>
                                    <p className={`text-lg md:text-2xl font-bold ${fluenceData.solarWindColor} mb-2`}>
                                        {fluenceData.solarWindLevel}
                                    </p>
                                    <p className="text-2xl md:text-3xl font-bold text-white">
                                        {fluenceData.speed} km/s
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <p className="text-sm md:text-base">Loading solar wind data...</p>
                                </div>
                            )}
                        </div>

                        {/* Fun Facts */}
                        <div className="bg-gradient-to-br from-slate-800/30 via-cyan-900/20 to-teal-800/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
                            <h3 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-center text-cyan-300">🚀 Fun Electron Facts</h3>
                            <div className="space-y-3 md:space-y-4 text-xs md:text-sm">
                                <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-lg md:rounded-xl p-3 md:p-4 border border-cyan-400/20">
                                    <p className="font-semibold text-cyan-200 text-xs md:text-sm">Did you know?</p>
                                    <p className="text-cyan-100 text-xs md:text-sm">Electrons are tiny particles that zoom around in space!</p>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg md:rounded-xl p-3 md:p-4 border border-yellow-400/20">
                                    <p className="font-semibold text-yellow-200 text-xs md:text-sm">Cool fact!</p>
                                    <p className="text-yellow-100 text-xs md:text-sm">When there are lots of electrons, satellites need to be careful!</p>
                                </div>
                                <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg md:rounded-xl p-3 md:p-4 border border-teal-400/20">
                                    <p className="font-semibold text-teal-200 text-xs md:text-sm">Amazing!</p>
                                    <p className="text-teal-100 text-xs md:text-sm">Solar wind carries electrons from the Sun to Earth!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forecast Section */}
                {fluenceData && (
                    <div className="mt-8 md:mt-12">
                        <div className="bg-gradient-to-br from-slate-800/30 via-cyan-900/20 to-teal-800/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center text-cyan-300">
                                🔮 4-Day Electron Forecast
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { day: "Today", fluence: fluenceData.current, label: "Current" },
                                    { day: "Tomorrow", fluence: fluenceData.forecast.dayTwo, label: "Day 2" },
                                    { day: "Day 3", fluence: fluenceData.forecast.dayThree, label: "Day 3" },
                                    { day: "Day 4", fluence: fluenceData.forecast.dayFour, label: "Day 4" }
                                ].map((forecast, index) => {
                                    const stormLevel = getElectronStormLevel(forecast.fluence);
                                    return (
                                        <div key={index} className="bg-gradient-to-br from-slate-700/20 to-cyan-800/20 rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-cyan-400/20">
                                            <h4 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-cyan-200">{forecast.day}</h4>
                                            <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${stormLevel.bgColor} mb-3 md:mb-4`}>
                                                <span className="text-2xl md:text-3xl">{stormLevel.emoji}</span>
                                            </div>
                                            <p className={`text-base md:text-lg font-bold ${stormLevel.color} mb-2`}>
                                                {stormLevel.level}
                                            </p>
                                            <p className="text-lg md:text-2xl font-bold text-cyan-200 mb-2">
                                                {forecast.fluence.toLocaleString()}
                                            </p>
                                            <p className="text-xs md:text-sm text-cyan-300">
                                                {stormLevel.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Real-time Chart Section */}
                <div className="mt-8 md:mt-12 flex justify-center">
                    <div className="bg-gradient-to-br from-slate-800/30 via-cyan-900/20 to-teal-800/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10 w-full max-w-6xl">
                        <div className="flex flex-col items-center mb-4 md:mb-6">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-cyan-300 flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                📈 Electron Fluence Chart
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`px-3 py-2 md:px-4 rounded-lg md:rounded-xl font-semibold transition-all text-sm md:text-base ${autoRefresh
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-600 text-slate-200'
                                        }`}
                                >
                                    <span className="hidden sm:inline">{autoRefresh ? '🔄 Auto-Update ON' : '⏸️ Auto-Update OFF'}</span>
                                    <span className="sm:hidden">{autoRefresh ? '🔄 ON' : '⏸️ OFF'}</span>
                                </button>
                                <button
                                    onClick={fetchFluenceData}
                                    className="px-3 py-2 md:px-4 bg-teal-500 text-white rounded-lg md:rounded-xl font-semibold hover:bg-teal-600 transition-colors text-sm md:text-base"
                                >
                                    🔄 Refresh Now
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">😞</div>
                                <p className="text-xl text-red-400 mb-2">Oops! Couldn't load electron data</p>
                                <p className="text-gray-400">Error: {error}</p>
                                <button
                                    onClick={fetchFluenceData}
                                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <ElectronFluenceChart data={chartData} loading={loading} />
                                <div className="mt-4 text-center text-sm text-gray-300">
                                    <p>📊 Showing electron fluence data from <a href="https://services.swpc.noaa.gov/json/electron_fluence_forecast.json" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">NOAA Space Weather Prediction Center</a></p>
                                    <p className="mt-1">Last updated: {fluenceData ? fluenceData.lastUpdated : 'Loading...'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Educational Section */}
                <div className="mt-8 md:mt-12">
                    <div className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center text-cyan-300">⚡ What are Electron Storms?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div>
                                <h4 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-cyan-300">🌌 Electrons in Space</h4>
                                <p className="text-sm md:text-lg text-cyan-100 leading-relaxed">
                                    Electrons are tiny particles that zoom around in space! When the Sun sends out energy,
                                    it carries lots of electrons with it. We count how many electrons are around Earth
                                    to understand space weather!
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-teal-300">🛰️ Why It Matters</h4>
                                <p className="text-sm md:text-lg text-teal-100 leading-relaxed">
                                    When there are too many electrons, they can affect satellites and make them work funny!
                                    That's why scientists watch electron storms very carefully to keep our technology
                                    safe and working properly!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Elements */}
                <div className="mt-6 md:mt-8 text-center">
                    <button
                        className="bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-bold py-3 px-6 md:py-4 md:px-8 rounded-xl md:rounded-2xl text-lg md:text-xl hover:scale-105 transition-transform duration-200 shadow-2xl shadow-cyan-500/25"
                        onClick={() => window.location.reload()}
                    >
                        <span className="hidden sm:inline">🔄 Check Electron Storms Again!</span>
                        <span className="sm:hidden">🔄 Refresh</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Electron Fluence Chart Component
function ElectronFluenceChart({ data, loading }) {
    const chartHeight = 250;
    const padding = 30;
    const plotHeight = chartHeight - 2 * padding;

    // Make chart width responsive and stretchable
    const minChartWidth = 400;
    const dataPoints = data ? data.length : 0;
    const chartWidth = Math.max(minChartWidth, dataPoints * 12);
    const plotWidth = chartWidth - 2 * padding;

    // Calculate chart dimensions and scales
    const chartInfo = useMemo(() => {
        if (!data || data.length === 0) {
            return { points: [], minFluence: 0, maxFluence: 1000000000, timeRange: null };
        }

        const fluenceValues = data.map(d => d.fluence);
        const times = data.map(d => d.date.getTime());

        const minFluence = Math.max(0, Math.floor(Math.min(...fluenceValues) / 1000000) * 1000000);
        const maxFluence = Math.ceil(Math.max(...fluenceValues) / 1000000) * 1000000;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        const scaleX = (time) => padding + ((time - minTime) / (maxTime - minTime)) * plotWidth;
        const scaleY = (fluence) => padding + plotHeight - ((fluence - minFluence) / (maxFluence - minFluence)) * plotHeight;

        const points = data.map(d => `${scaleX(d.date.getTime())},${scaleY(d.fluence)}`).join(' ');

        return {
            points,
            minFluence,
            maxFluence,
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
                    <p className="text-xl text-yellow-200">Loading electron data from space... ⚡</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl text-gray-300">No electron fluence data available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-2xl p-6 border border-white/20 shadow-2xl w-full">
                <div className="overflow-x-auto overflow-y-hidden w-full flex justify-center">
                    <svg width={chartWidth} height={chartHeight} className="h-auto" style={{ minWidth: '100%', maxWidth: '100%' }}>
                        {/* Background */}
                        <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="rgba(15, 23, 42, 0.8)" />

                        {/* Main grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                            const fluence = chartInfo.minFluence + (chartInfo.maxFluence - chartInfo.minFluence) * ratio;
                            return (
                                <g key={ratio}>
                                    <line
                                        x1={padding}
                                        y1={chartInfo.scaleY ? chartInfo.scaleY(fluence) : 0}
                                        x2={chartWidth - padding}
                                        y2={chartInfo.scaleY ? chartInfo.scaleY(fluence) : 0}
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="1"
                                        strokeDasharray="3,6"
                                    />
                                    <text
                                        x={padding - 15}
                                        y={chartInfo.scaleY ? chartInfo.scaleY(fluence) + 5 : 0}
                                        fontSize="14"
                                        fill="#e2e8f0"
                                        textAnchor="end"
                                        fontWeight="600"
                                    >
                                        {(fluence / 1000000).toFixed(0)}M
                                    </text>
                                </g>
                            );
                        })}

                        {/* Color-coded background bands */}
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(10000000) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(0) - chartInfo.scaleY(10000000) : 0}
                            fill="rgba(34, 197, 94, 0.15)"
                            stroke="rgba(34, 197, 94, 0.3)"
                            strokeWidth="1"
                        />
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(50000000) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(10000000) - chartInfo.scaleY(50000000) : 0}
                            fill="rgba(59, 130, 246, 0.15)"
                            stroke="rgba(59, 130, 246, 0.3)"
                            strokeWidth="1"
                        />
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(100000000) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(50000000) - chartInfo.scaleY(100000000) : 0}
                            fill="rgba(251, 191, 36, 0.15)"
                            stroke="rgba(251, 191, 36, 0.3)"
                            strokeWidth="1"
                        />
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(500000000) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(100000000) - chartInfo.scaleY(500000000) : 0}
                            fill="rgba(249, 115, 22, 0.15)"
                            stroke="rgba(249, 115, 22, 0.3)"
                            strokeWidth="1"
                        />
                        <rect
                            x={padding}
                            y={chartInfo.scaleY ? chartInfo.scaleY(chartInfo.maxFluence) : 0}
                            width={plotWidth}
                            height={chartInfo.scaleY ? chartInfo.scaleY(500000000) - chartInfo.scaleY(chartInfo.maxFluence) : 0}
                            fill="rgba(239, 68, 68, 0.15)"
                            stroke="rgba(239, 68, 68, 0.3)"
                            strokeWidth="1"
                        />

                        {/* Chart line */}
                        <polyline
                            points={chartInfo.points}
                            fill="none"
                            stroke="url(#electronGradient)"
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
                                    {data[0].date.toLocaleDateString('en-GB', {
                                        timeZone: 'GMT',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </text>
                                <text
                                    x={chartWidth - padding}
                                    y={chartHeight - 10}
                                    fontSize="12"
                                    fill="#94a3b8"
                                    textAnchor="end"
                                >
                                    {data[data.length - 1].date.toLocaleDateString('en-GB', {
                                        timeZone: 'GMT',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </text>
                            </>
                        )}

                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="electronGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="25%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#fbbf24" />
                                <stop offset="75%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                        </defs>

                        {/* Data points */}
                        {data.map((point, index) => {
                            const x = chartInfo.scaleX ? chartInfo.scaleX(point.date.getTime()) : 0;
                            const y = chartInfo.scaleY ? chartInfo.scaleY(point.fluence) : 0;
                            const stormLevel = getElectronStormLevel(point.fluence);

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
                                    fill={getColorHex(stormLevel.color)}
                                    stroke="white"
                                    strokeWidth="2"
                                    className="hover:r-6 transition-all duration-200"
                                >
                                    <title>{`${point.date.toLocaleDateString('en-GB', {
                                        timeZone: 'GMT',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}: ${(point.fluence / 1000000).toFixed(1)}M electrons (${stormLevel.level})`}</title>
                                </circle>
                            );
                        })}

                        {/* Latest point highlight */}
                        {data.length > 0 && (
                            <circle
                                cx={chartInfo.scaleX ? chartInfo.scaleX(data[data.length - 1].date.getTime()) : 0}
                                cy={chartInfo.scaleY ? chartInfo.scaleY(data[data.length - 1].fluence) : 0}
                                r="8"
                                fill="white"
                                stroke="#fbbf24"
                                strokeWidth="3"
                            />
                        )}
                    </svg>
                </div>

                {/* Scroll indicator */}
                {chartWidth > 600 && (
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
                        <span className="text-gray-300">😌 Calm (&lt; 10M)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-gray-300">😊 Gentle (10M-50M)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-300">🤩 Active (50M-100M)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span className="text-gray-300">🌪️ Stormy (100M-500M)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-gray-300">😡 Extreme (&gt; 500M)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
