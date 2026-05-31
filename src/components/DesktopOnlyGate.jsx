export default function DesktopOnlyGate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="text-6xl" aria-hidden="true">
          💻
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
          Solar Storms to Auroras
        </h1>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
          <p className="text-lg text-white/90 leading-relaxed">
            This experience is built for <strong>laptop and desktop</strong> screens.
            It uses 3D simulations and interactive modules that are not supported on
            mobile or tablet devices.
          </p>
          <p className="text-white/70">
            Please open this site on a PC or laptop for the full experience.
          </p>
        </div>
        <p className="text-sm text-white/50">
          ExoVisionaries · NASA Space Apps Challenge 2025 Global Finalist
        </p>
      </div>
    </div>
  );
}
