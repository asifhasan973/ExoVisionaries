import { useEffect, useState } from "react";

const MOBILE_UA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
const TABLET_UA = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i;
const MIN_DESKTOP_WIDTH = 1024;

export function checkIsDesktop() {
  if (typeof window === "undefined") return true;

  const ua = navigator.userAgent;
  const isMobileOrTablet =
    MOBILE_UA.test(ua) ||
    TABLET_UA.test(ua) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < MIN_DESKTOP_WIDTH);

  return !isMobileOrTablet && window.innerWidth >= MIN_DESKTOP_WIDTH;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(checkIsDesktop);

  useEffect(() => {
    const update = () => setIsDesktop(checkIsDesktop());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isDesktop;
}
