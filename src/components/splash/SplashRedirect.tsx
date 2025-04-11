'use client';

import { useEffect, useState } from 'react';

export function SplashScreenRedirect() {
  const [hasChecked, setHasChecked] = useState(false);
  
  useEffect(() => {
    // Only run this once
    if (hasChecked) return;
    setHasChecked(true);
    
    // Skip redirect if:
    // 1. Coming from the splash page
    // 2. Already seen splash according to localStorage
    const fromSplash = window.location.search.includes('from_splash=true');
    const hasSeenSplash = localStorage.getItem('brisk_has_seen_splash') === 'true';
    
    if (!fromSplash && !hasSeenSplash) {
      window.location.href = '/splash.html';
    }
  }, [hasChecked]);
  
  // Component doesn't render anything visible
  return null;
}
