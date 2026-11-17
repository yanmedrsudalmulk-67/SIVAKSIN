import { useState, useEffect } from 'react';

export function useIsDesktopOrLandscape(): boolean {
  const [isDesktopOrLandscape, setIsDesktopOrLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    return window.innerWidth >= 1024 || (window.innerWidth >= 768 && isLandscape);
  });

  useEffect(() => {
    const checkViewport = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      setIsDesktopOrLandscape(window.innerWidth >= 1024 || (window.innerWidth >= 768 && isLandscape));
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, []);

  return isDesktopOrLandscape;
}
