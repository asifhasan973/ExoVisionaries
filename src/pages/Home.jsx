import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useEffect, useRef, useState } from "react";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import Toast from "../components/ui/Toast";
import { useImagePreload } from "../hooks/useImagePreload";

export default function Home() {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const location = useLocation();
  const { done: imgsReady, progress } = useImagePreload([
    "/images/astranaut2.png",
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const markReady = () => {
      if (!cancelled) setVideoReady(true);
    };

    const tryPlay = async () => {
      if (cancelled || !video) return;

      try {
        video.muted = true;
        await video.play();
        markReady();
      } catch {
        const onInteraction = () => {
          video.play().finally(markReady);
          document.removeEventListener("click", onInteraction);
        };
        document.addEventListener("click", onInteraction, { once: true });
        markReady();
      }
    };

    video.addEventListener("canplay", tryPlay);
    video.addEventListener("playing", markReady);

    if (video.readyState >= 3) {
      tryPlay();
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && video.paused) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    if (location.state?.fromLogin) {
      setTimeout(tryPlay, 300);
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("playing", markReady);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <LoadingOverlay show={!(videoReady && imgsReady)} label={`Loading… ${progress ?? 0}%`} />

      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 -z-30 h-full w-full object-cover scale-x-[-1] home-video-bg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controls={false}
      >
        <source src="/videos/1851190-uhd_3840_2160_25fps.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-purple-900/60 via-indigo-900/60 to-black/80" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="flex flex-col items-center lg:items-start justify-center px-4 sm:px-6 md:px-8 lg:px-16 text-center lg:text-left xl:ps-32 pt-20 lg:pt-0">
          <h1 className="home-fade-up home-fade-up-delay-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-extrabold tracking-wide drop-shadow-lg leading-tight">
            <span className="animate-home-gradient bg-gradient-to-r from-pink-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent moo-lah-lah-regular">
              Solar <br /> Storms
              to
              <br /> Auroras
            </span>
          </h1>
          <p className="home-fade-up home-fade-up-delay-2 mt-4 text-lg sm:text-xl md:text-2xl text-white/80 font-bold max-w-2xl">
            Every Flare Tells a Story Worth Exploring.
          </p>

          <div className="home-fade-up home-fade-up-delay-3 mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link to="/start" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="home-btn-hover w-full sm:w-auto bg-fuchsia-500 hover:bg-fuchsia-400 text-white shadow-lg"
              >
                <span className="font-bold text-base sm:text-lg">Start Journey</span>
              </Button>
            </Link>
            <Link to="/aurora" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="home-btn-hover w-full sm:w-auto bg-white/20 text-white hover:bg-white/30 shadow-lg"
              >
                <span className="font-bold text-base sm:text-lg">Aurora Lab</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center order-first lg:order-last">
          <img
            src="/images/astranaut2.png"
            alt="Astronaut Stelly"
            className="home-fade-up home-fade-up-delay-2 absolute top-10 sm:top-20 lg:top-40 right-4 sm:right-8 lg:right-40 h-[25vh] sm:h-[35vh] lg:h-[90vh] w-auto animate-home-float drop-shadow-[0_10px_30px_rgba(59,130,246,.6)]"
            draggable={false}
          />
        </div>
      </div>

      {showToast && (
        <Toast
          message="💻 Use Laptop and Ctrl - or Ctrl + for better experience and adjustment"
          duration={6000}
          type="info"
          position="top-right"
          clickToDismiss={true}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
