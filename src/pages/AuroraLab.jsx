import React, { useEffect, useRef, useState } from 'react';

const AuroraLab = () => {
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cleanup = [];

        const loadResources = async () => {
            try {
                // Load CSS files
                const loadCSS = (href) => {
                    return new Promise((resolve, reject) => {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = href;
                        link.onload = resolve;
                        link.onerror = reject;
                        document.head.appendChild(link);
                        cleanup.push(() => {
                            if (link.parentNode) {
                                link.parentNode.removeChild(link);
                            }
                        });
                    });
                };

                // Load Google Fonts
                const fontLink = document.createElement('link');
                fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap';
                fontLink.rel = 'stylesheet';
                document.head.appendChild(fontLink);
                cleanup.push(() => {
                    if (fontLink.parentNode) {
                        fontLink.parentNode.removeChild(fontLink);
                    }
                });

                // Load CSS files
                await Promise.all([
                    loadCSS('/aurora-lab/styles/main.css'),
                    loadCSS('/aurora-lab/styles/control-panel.css')
                ]);

                // Create import map for Three.js
                const importMap = document.createElement('script');
                importMap.type = 'importmap';
                importMap.textContent = JSON.stringify({
                    imports: {
                        three: 'https://unpkg.com/three@0.160.0/build/three.module.js'
                    }
                });
                document.head.appendChild(importMap);
                cleanup.push(() => {
                    if (importMap.parentNode) {
                        importMap.parentNode.removeChild(importMap);
                    }
                });

                // Wait a bit for import map to be processed
                await new Promise(resolve => setTimeout(resolve, 100));

                // Load scripts
                const loadScript = (src, isModule = false) => {
                    return new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = src;
                        if (isModule) script.type = 'module';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                        cleanup.push(() => {
                            if (script.parentNode) {
                                script.parentNode.removeChild(script);
                            }
                        });
                    });
                };

                await loadScript('/aurora-lab/scripts/loader.js');

                await new Promise(resolve => setTimeout(resolve, 200));
                await loadScript('/aurora-lab/scripts/main.js', true);

                // Add a small delay to ensure Three.js has time to initialize
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        loadResources();

        // Cleanup function
        return () => {
            cleanup.forEach(fn => fn());
        };
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <h2 className="text-2xl font-bold mb-4">Aurora Lab Loading Error</h2>
                    <p className="text-red-400 mb-4">Failed to load Aurora Lab: {error}</p>
                    <p className="text-gray-400 mb-6 text-sm">
                        This might be due to network issues or browser compatibility.
                        Please check your browser console for more details.
                    </p>
                    <div className="space-x-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="aurora-lab-container"
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#00000a'
            }}
        >
            {/* Loading Screen */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-50">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-lg">Loading Aurora Lab...</p>
                    </div>
                </div>
            )}

            {/* Loader (will be controlled by the loaded script) */}
            <div id="loader" style={{ display: isLoading ? 'flex' : 'none' }}>
                <div className="saturn-stars"></div>
                <div className="saturn-loader">
                    <div className="saturn-planet"></div>
                    <div className="saturn-ring"></div>
                </div>
                <p className="loading-text">Launching Simulation...</p>
            </div>

            {/* View switching buttons */}
            <div className="view-switch">
                <button id="space-view-btn" className="active">Space View</button>
                <div id="ground-view-wrapper" className="ground-view-wrapper">
                    <button id="ground-view-btn">Ground View</button>
                    <div className="pole-buttons-container">
                        <button id="north-pole-btn">North Pole</button>
                        <button id="south-pole-btn">South Pole</button>
                    </div>
                </div>
                <button id="active-pole-btn" style={{ display: 'none' }}></button>
            </div>

            {/* Ground view container */}
            <div id="ground-view-container"></div>

            {/* Three.js will attach its canvas here */}
            <div id="three-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>

            {/* Control Panel */}
            <div className="control-panel" id="control-panel">
                <div className="control-header">
                    <h2 className='pt-5 ps-5'>Aurora Lab</h2>
                    <div className="panel-icons">
                        {/* Collapse icon */}
                        <svg className="toggle-panel-icon" width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {/* Expand icon */}
                        <svg className="expand-icon" width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 2L10 2L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 14L6 14L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 6L2 2L6 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 10L14 14L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                <div className="control-panel-content">

                    {/* Welcome & Instructions */}
                    <div className="info-section">
                        <h3>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor" />
                            </svg>
                            Welcome to Aurora Lab
                        </h3>
                        <p>Create stunning custom auroras by controlling solar wind parameters and observing their effects on Earth's magnetosphere.</p>
                        <ul>
                            <li><strong>Click the Sun</strong> to manually trigger solar wind emissions</li>
                            <li><strong>Adjust parameters</strong> below to see different aurora effects</li>
                            <li><strong>Switch views</strong> using buttons at the bottom</li>
                            <li><strong>Enable real-time mode</strong> for actual space weather data</li>
                        </ul>
                    </div>

                    {/* How It Works */}
                    <div className="instructions-section">
                        <h3>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
                            </svg>
                            How It Works
                        </h3>

                        <div className="instruction-item">
                            <div className="instruction-icon">1</div>
                            <div className="instruction-text">
                                <strong>Solar Wind:</strong> Charged particles from the Sun travel through space toward Earth
                            </div>
                        </div>

                        <div className="instruction-item">
                            <div className="instruction-icon">2</div>
                            <div className="instruction-text">
                                <strong>Magnetosphere:</strong> Earth's magnetic field deflects most particles, creating a protective shield
                            </div>
                        </div>

                        <div className="instruction-item">
                            <div className="instruction-icon">3</div>
                            <div className="instruction-text">
                                <strong>Aurora Formation:</strong> Some particles enter the atmosphere at the poles, creating beautiful light displays
                            </div>
                        </div>
                    </div>
                    {/* Solar Wind Parameters */}
                    <div className="control-section expanded">
                        <div className="control-section-header">
                            <h3>Solar Wind Parameters</h3>
                            <svg className="section-toggle-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="control-section-content">
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontStyle: 'italic' }}>
                                Adjust the properties of solar wind particles traveling from the Sun to Earth
                            </div>
                            <div className="control-row">
                                <label className="control-label" title="Velocity of solar wind particles (km/s). Higher speeds create stronger auroras.">
                                    Speed (km/s)
                                </label>
                                <div className="control-input-wrapper">
                                    <input type="range" className="control-input" name="windSpeed" min="300" max="1200" step="10" defaultValue="500" />
                                    <div className="control-value">500</div>
                                </div>
                            </div>
                            <div className="control-row">
                                <label className="control-label" title="Number of particles per cubic centimeter. Higher density creates more intense auroras.">
                                    Density (p/cm³)
                                </label>
                                <div className="control-input-wrapper">
                                    <input type="range" className="control-input" name="density" min="1" max="50" step="1" defaultValue="10" />
                                    <div className="control-value">10</div>
                                </div>
                            </div>
                            <div className="control-row">
                                <label className="control-label" title="Interplanetary Magnetic Field Z-component (nT). Negative values favor aurora formation.">
                                    IMF Bz (nT)
                                </label>
                                <div className="control-input-wrapper">
                                    <input type="range" className="control-input" name="bz" min="-20" max="5" step="0.5" defaultValue="-5" />
                                    <div className="control-value">-5</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emission Settings */}
                    <div className="control-section expanded">
                        <div className="control-section-header">
                            <h3>Emission Control</h3>
                            <svg className="section-toggle-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="control-section-content">
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontStyle: 'italic' }}>
                                Control automatic solar wind emissions from the Sun
                            </div>
                            <div className="control-row">
                                <label className="control-label" title="Time between automatic solar wind bursts (seconds). Set to 0 to disable auto-emissions.">
                                    Interval (seconds)
                                </label>
                                <div className="control-input-wrapper">
                                    <input type="range" className="control-input" name="emissionInterval" min="0" max="20" step="1" defaultValue="5" />
                                    <div className="control-value">5</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                💡 <strong>Tip:</strong> Click the Sun in the simulation to manually trigger emissions!
                            </div>
                        </div>
                    </div>

                    {/* Data Mode */}
                    <div className="control-section expanded">
                        <div className="control-section-header">
                            <h3>Data Source</h3>
                            <svg className="section-toggle-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="control-section-content">
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontStyle: 'italic' }}>
                                Choose between simulated parameters or real NASA space weather data
                            </div>
                            <div className="control-row">
                                <label className="control-label" title="Use real-time space weather data from NASA's DONKI database">
                                    Real-time NASA Data
                                </label>
                                <div className="real-mode-wrapper">
                                    <input type="checkbox" className="control-input" name="realMode" id="realMode" />
                                    <div className="loading-spinner" id="real-mode-spinner"></div>
                                </div>
                                <div className="error-message" id="real-mode-error"></div>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                🌐 When enabled, uses actual solar wind measurements and coronal mass ejection data
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="info-section" style={{ marginTop: '20px' }}>
                        <h3>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2l3.09 6.26L22 9l-6.91.74L12 16l-3.09-6.26L2 9l6.91-.74L12 2z" fill="currentColor" />
                            </svg>
                            Quick Tips
                        </h3>
                        <ul style={{ fontSize: '12px', lineHeight: '1.6' }}>
                            <li><strong>Best Aurora Conditions:</strong> High speed (800+ km/s), moderate density (5-15 p/cm³), negative IMF Bz (-5 to -15 nT)</li>
                            <li><strong>View Controls:</strong> Use mouse to rotate, scroll to zoom in/out</li>
                            <li><strong>Ground Views:</strong> Switch to North/South pole views to see auroras from Earth's surface</li>
                            <li><strong>Experiment:</strong> Try extreme values to see how different conditions affect aurora formation</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuroraLab;