import React, { useState, useEffect, useRef, useCallback } from 'react';

const Earth3D = () => {
    const [northImages, setNorthImages] = useState([]);
    const [southImages, setSouthImages] = useState([]);
    const [northCurrentIndex, setNorthCurrentIndex] = useState(0);
    const [southCurrentIndex, setSouthCurrentIndex] = useState(0);
    const [northIsPlaying, setNorthIsPlaying] = useState(false);
    const [southIsPlaying, setSouthIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [northImagesLoaded, setNorthImagesLoaded] = useState(false);
    const [southImagesLoaded, setSouthImagesLoaded] = useState(false);
    const [northPlaybackSpeed, setNorthPlaybackSpeed] = useState(8);
    const [southPlaybackSpeed, setSouthPlaybackSpeed] = useState(8);

    const northAnimationRef = useRef(null);
    const southAnimationRef = useRef(null);
    const northLastFrameTime = useRef(0);
    const southLastFrameTime = useRef(0);

    const northCanvasRef = useRef(null);
    const southCanvasRef = useRef(null);

    const northImageObjects = useRef([]);
    const southImageObjects = useRef([]);

    const baseUrl = 'https://services.swpc.noaa.gov';

    const speedToMs = (speed) => {
        const normalizedSpeed = (speed - 1) / 9;
        const exponentialSpeed = Math.pow(normalizedSpeed, 0.6);
        return Math.round(1000 - exponentialSpeed * 950);
    };

    const preloadImages = async (imageUrls, hemisphere, totalImages) => {
        const imagePromises = imageUrls.map((imageData) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    resolve(img);
                };

                img.onerror = () => {
                    resolve(null);
                };

                img.src = baseUrl + imageData.url;
            });
        });

        const loadedImages = await Promise.all(imagePromises);

        if (hemisphere === 'north') {
            northImageObjects.current = loadedImages.filter(img => img !== null);
            setNorthImagesLoaded(true);
        } else {
            southImageObjects.current = loadedImages.filter(img => img !== null);
            setSouthImagesLoaded(true);
        }

        return loadedImages;
    };

    const fetchAuroraData = async () => {
        try {
            setIsLoading(true);
            setLoadingProgress(0);

            const [northResponse, southResponse] = await Promise.all([
                fetch('https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json'),
                fetch('https://services.swpc.noaa.gov/products/animations/ovation_south_24h.json')
            ]);

            const northData = await northResponse.json();
            const southData = await southResponse.json();

            const reversedNorth = northData.reverse();
            const reversedSouth = southData.reverse();

            setNorthImages(reversedNorth);
            setSouthImages(reversedSouth);

            const total = reversedNorth.length + reversedSouth.length;

            await Promise.all([
                preloadImages(reversedNorth, 'north', total),
                preloadImages(reversedSouth, 'south', total)
            ]);

            setLoadingProgress(100);

        } catch {
            // Aurora animation data unavailable
        } finally {
            setIsLoading(false);
        }
    };

    const renderToCanvas = useCallback((canvas, imageObjects, currentIndex) => {
        if (!canvas || !imageObjects[currentIndex]) return;

        const ctx = canvas.getContext('2d');
        const img = imageObjects[currentIndex];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const aspectRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.width / aspectRatio;

        if (drawHeight > canvas.height) {
            drawHeight = canvas.height;
            drawWidth = canvas.height * aspectRatio;
        }

        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
    }, []);

    const animateNorth = useCallback((timestamp) => {
        if (!northIsPlaying) return;

        const frameDelay = speedToMs(northPlaybackSpeed);

        if (timestamp - northLastFrameTime.current >= frameDelay) {
            setNorthCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % northImages.length;

                if (northCanvasRef.current && northImageObjects.current.length > 0) {
                    renderToCanvas(northCanvasRef.current, northImageObjects.current, nextIndex);
                }

                return nextIndex;
            });

            northLastFrameTime.current = timestamp;
        }

        northAnimationRef.current = requestAnimationFrame(animateNorth);
    }, [northIsPlaying, northPlaybackSpeed, northImages.length, renderToCanvas]);

    const animateSouth = useCallback((timestamp) => {
        if (!southIsPlaying) return;

        const frameDelay = speedToMs(southPlaybackSpeed);

        if (timestamp - southLastFrameTime.current >= frameDelay) {
            setSouthCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % southImages.length;

                if (southCanvasRef.current && southImageObjects.current.length > 0) {
                    renderToCanvas(southCanvasRef.current, southImageObjects.current, nextIndex);
                }

                return nextIndex;
            });

            southLastFrameTime.current = timestamp;
        }

        southAnimationRef.current = requestAnimationFrame(animateSouth);
    }, [southIsPlaying, southPlaybackSpeed, southImages.length, renderToCanvas]);

    // Play/pause for Northern Hemisphere
    const toggleNorthPlayPause = () => {
        if (northIsPlaying) {
            if (northAnimationRef.current) {
                cancelAnimationFrame(northAnimationRef.current);
            }
            setNorthIsPlaying(false);
        } else {
            setNorthIsPlaying(true);
            northLastFrameTime.current = performance.now();
            northAnimationRef.current = requestAnimationFrame(animateNorth);
        }
    };

    // Play/pause for Southern Hemisphere
    const toggleSouthPlayPause = () => {
        if (southIsPlaying) {
            if (southAnimationRef.current) {
                cancelAnimationFrame(southAnimationRef.current);
            }
            setSouthIsPlaying(false);
        } else {
            setSouthIsPlaying(true);
            southLastFrameTime.current = performance.now();
            southAnimationRef.current = requestAnimationFrame(animateSouth);
        }
    };

    // Reset functions
    const resetNorth = () => {
        if (northAnimationRef.current) {
            cancelAnimationFrame(northAnimationRef.current);
        }
        setNorthIsPlaying(false);
        setNorthCurrentIndex(0);

        // Render first frame
        if (northCanvasRef.current && northImageObjects.current.length > 0) {
            renderToCanvas(northCanvasRef.current, northImageObjects.current, 0);
        }
    };

    const resetSouth = () => {
        if (southAnimationRef.current) {
            cancelAnimationFrame(southAnimationRef.current);
        }
        setSouthIsPlaying(false);
        setSouthCurrentIndex(0);

        // Render first frame
        if (southCanvasRef.current && southImageObjects.current.length > 0) {
            renderToCanvas(southCanvasRef.current, southImageObjects.current, 0);
        }
    };

    // Speed change handlers
    const handleNorthSpeedChange = (e) => {
        const newSpeed = parseInt(e.target.value);
        setNorthPlaybackSpeed(newSpeed);
    };

    const handleSouthSpeedChange = (e) => {
        const newSpeed = parseInt(e.target.value);
        setSouthPlaybackSpeed(newSpeed);
    };

    // Update canvas size on resize
    const updateCanvasSize = useCallback(() => {
        [northCanvasRef, southCanvasRef].forEach(canvasRef => {
            if (canvasRef.current) {
                const parent = canvasRef.current.parentElement;
                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
            }
        });

        // Re-render current frames
        if (northCanvasRef.current && northImageObjects.current.length > 0) {
            renderToCanvas(northCanvasRef.current, northImageObjects.current, northCurrentIndex);
        }
        if (southCanvasRef.current && southImageObjects.current.length > 0) {
            renderToCanvas(southCanvasRef.current, southImageObjects.current, southCurrentIndex);
        }
    }, [northCurrentIndex, southCurrentIndex, renderToCanvas]);

    // Start animation loops when playing state changes
    useEffect(() => {
        if (northIsPlaying) {
            northLastFrameTime.current = performance.now();
            northAnimationRef.current = requestAnimationFrame(animateNorth);
        }

        return () => {
            if (northAnimationRef.current) {
                cancelAnimationFrame(northAnimationRef.current);
            }
        };
    }, [northIsPlaying, animateNorth]);

    useEffect(() => {
        if (southIsPlaying) {
            southLastFrameTime.current = performance.now();
            southAnimationRef.current = requestAnimationFrame(animateSouth);
        }

        return () => {
            if (southAnimationRef.current) {
                cancelAnimationFrame(southAnimationRef.current);
            }
        };
    }, [southIsPlaying, animateSouth]);

    // Update the initial render effects to ensure both render properly
    useEffect(() => {
        if (northImagesLoaded && northCanvasRef.current && northImageObjects.current.length > 0) {
            // Set canvas size first
            const parent = northCanvasRef.current.parentElement;
            northCanvasRef.current.width = parent.clientWidth;
            northCanvasRef.current.height = parent.clientHeight;
            // Then render
            renderToCanvas(northCanvasRef.current, northImageObjects.current, northCurrentIndex);
        }
    }, [northImagesLoaded, northCurrentIndex, renderToCanvas]);

    useEffect(() => {
        if (southImagesLoaded && southCanvasRef.current && southImageObjects.current.length > 0) {
            // Set canvas size first
            const parent = southCanvasRef.current.parentElement;
            southCanvasRef.current.width = parent.clientWidth;
            southCanvasRef.current.height = parent.clientHeight;
            // Then render
            renderToCanvas(southCanvasRef.current, southImageObjects.current, southCurrentIndex);
        }
    }, [southImagesLoaded, southCurrentIndex, renderToCanvas]);

    // Handle window resize
    useEffect(() => {
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [updateCanvasSize]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (northAnimationRef.current) {
                cancelAnimationFrame(northAnimationRef.current);
            }
            if (southAnimationRef.current) {
                cancelAnimationFrame(southAnimationRef.current);
            }
        };
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        fetchAuroraData();
    }, []);

    return (
        <div className="w-full h-full">
            <div className="text-center mb-3 sm:mb-4 px-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">3D Aurora Forecast</h2>
                <p className="text-gray-300 text-xs sm:text-sm">Last 24 Hours - Live Data from NOAA Space Weather Prediction Center</p>

                {/* Loading Progress Bar - Fixed */}
                {isLoading && (
                    <div className="mt-3 max-w-md mx-auto">
                        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                            Loading images... {loadingProgress}%
                        </p>
                    </div>
                )}

                <button
                    onClick={() => window.open('https://www.swpc.noaa.gov/products/aurora-30-minute-forecast', '_blank', 'noopener')}
                    className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-semibold text-sm sm:text-base"
                >
                    Open Official Page ↗
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 h-full">
                {/* Northern Hemisphere */}
                <div className="flex flex-col h-full">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white text-center mb-3 sm:mb-4">
                        Northern Hemisphere
                    </h3>

                    {/* Northern Canvas Player */}
                    <div className="relative w-full flex-1 bg-black rounded-lg overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-white text-sm sm:text-base md:text-lg animate-pulse">
                                    Preloading Northern Hemisphere images...
                                </div>
                            </div>
                        ) : northImagesLoaded ? (
                            <>
                                <canvas
                                    ref={northCanvasRef}
                                    className="w-full h-full"
                                    style={{ imageRendering: 'high-quality' }}
                                />
                                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
                                    {northImages[northCurrentIndex]?.time_tag ?
                                        new Date(northImages[northCurrentIndex].time_tag).toLocaleString() :
                                        'Loading...'
                                    }
                                </div>
                                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
                                    Frame {northCurrentIndex + 1} / {northImages.length}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white text-sm sm:text-base">
                                No Northern data available
                            </div>
                        )}
                    </div>

                    {/* Northern Controls */}
                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                        <div className="flex justify-center space-x-2 sm:space-x-3">
                            <button
                                onClick={toggleNorthPlayPause}
                                className={`px-3 sm:px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${northIsPlaying
                                    ? 'bg-red-600 hover:bg-red-700 text-white scale-105'
                                    : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                                    }`}
                                disabled={isLoading || !northImagesLoaded}
                            >
                                {northIsPlaying ? '⏸️ Pause' : '▶️ Play'}
                            </button>
                            <button
                                onClick={resetNorth}
                                className="px-3 sm:px-4 md:px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm hover:scale-105"
                                disabled={isLoading || !northImagesLoaded}
                            >
                                🔄 Reset
                            </button>
                        </div>
                        <div className="max-w-xs mx-auto">
                            <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-center">
                                Speed: {northPlaybackSpeed}/10 ({Math.round(1000 / speedToMs(northPlaybackSpeed))} fps)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={northPlaybackSpeed}
                                onChange={handleNorthSpeedChange}
                                className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${northPlaybackSpeed * 10}%, #374151 ${northPlaybackSpeed * 10}%, #374151 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Slow</span>
                                <span className="text-green-400">●</span>
                                <span>Fast</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Southern Hemisphere */}
                <div className="flex flex-col h-full">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white text-center mb-3 sm:mb-4">
                        Southern Hemisphere
                    </h3>

                    {/* Southern Canvas Player */}
                    <div className="relative w-full flex-1 bg-black rounded-lg overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-white text-sm sm:text-base md:text-lg animate-pulse">
                                    Preloading Southern Hemisphere images...
                                </div>
                            </div>
                        ) : southImagesLoaded ? (
                            <>
                                <canvas
                                    ref={southCanvasRef}
                                    className="w-full h-full"
                                    style={{ imageRendering: 'high-quality' }}
                                />
                                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
                                    {southImages[southCurrentIndex]?.time_tag ?
                                        new Date(southImages[southCurrentIndex].time_tag).toLocaleString() :
                                        'Loading...'
                                    }
                                </div>
                                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
                                    Frame {southCurrentIndex + 1} / {southImages.length}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white text-sm sm:text-base">
                                No Southern data available
                            </div>
                        )}
                    </div>

                    {/* Southern Controls */}
                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                        <div className="flex justify-center space-x-2 sm:space-x-3">
                            <button
                                onClick={toggleSouthPlayPause}
                                className={`px-3 sm:px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${southIsPlaying
                                    ? 'bg-red-600 hover:bg-red-700 text-white scale-105'
                                    : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                                    }`}
                                disabled={isLoading || !southImagesLoaded}
                            >
                                {southIsPlaying ? '⏸️ Pause' : '▶️ Play'}
                            </button>
                            <button
                                onClick={resetSouth}
                                className="px-3 sm:px-4 md:px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm hover:scale-105"
                                disabled={isLoading || !southImagesLoaded}
                            >
                                🔄 Reset
                            </button>
                        </div>
                        <div className="max-w-xs mx-auto">
                            <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-center">
                                Speed: {southPlaybackSpeed}/10 ({Math.round(1000 / speedToMs(southPlaybackSpeed))} fps)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={southPlaybackSpeed}
                                onChange={handleSouthSpeedChange}
                                className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${southPlaybackSpeed * 10}%, #374151 ${southPlaybackSpeed * 10}%, #374151 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Slow</span>
                                <span className="text-green-400">●</span>
                                <span>Fast</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add custom CSS for slider */}
            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #10b981;
                    cursor: pointer;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                .slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #10b981;
                    cursor: pointer;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    border: none;
                }
            `}</style>
        </div>
    );
};

export default Earth3D;