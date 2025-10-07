"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/utils/urlUtils";
import styles from "./ScrollProgress.module.scss";

interface ScrollProgressProps {
  tabs: Array<{ title: string; content: string }>;
}

export function ScrollProgress({ tabs }: ScrollProgressProps) {
  const [progressToNext, setProgressToNext] = useState(0);
  const router = useRouter();
  const lastActiveTabIndex = useRef<number>(-1);
  const isProgrammaticScroll = useRef<boolean>(false);

  // Function to set programmatic scroll flag
  const setProgrammaticScroll = (value: boolean) => {
    isProgrammaticScroll.current = value;
  };

  // Expose the function globally for use in other components
  useEffect(() => {
    (
      window as Window & { setProgrammaticScroll?: (value: boolean) => void }
    ).setProgrammaticScroll = setProgrammaticScroll;
    return () => {
      delete (
        window as Window & { setProgrammaticScroll?: (value: boolean) => void }
      ).setProgrammaticScroll;
    };
  }, []);

  useEffect(() => {
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const updateThrottle = 200; // Only update URL every 200ms

    const handleScroll = () => {
      if (rafId) {
        return; // Already scheduled
      }

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const now = Date.now();

        let activeTabIndex = 0;
        let maxVisibleScore = 0;

        // Simplified calculation for better performance
        for (let i = 0; i < tabs.length; i++) {
          const element = window.document.getElementById(`tab-${i}`);
          if (element) {
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Simpler visibility check - look for the section closest to the top
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(viewportHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visiblePercentage =
              rect.height > 0 ? visibleHeight / rect.height : 0;

            // Consider sections that have their top within viewport or are dominating the view
            if (
              rect.top <= 150 &&
              rect.bottom > 0 &&
              visiblePercentage > maxVisibleScore
            ) {
              maxVisibleScore = visiblePercentage;
              activeTabIndex = i;
            }
          }
        }

        // Only update URL if enough time has passed and it's a real change
        if (
          activeTabIndex !== lastActiveTabIndex.current &&
          !isProgrammaticScroll.current &&
          now - lastUpdateTime > updateThrottle &&
          maxVisibleScore > 0.3 // Require significant visibility before switching
        ) {
          lastActiveTabIndex.current = activeTabIndex;
          lastUpdateTime = now;

          // Use homepage for first tab, otherwise use tab slug
          if (activeTabIndex === 0) {
            window.history.replaceState(null, "", "/");
          } else {
            const activeTab = tabs[activeTabIndex];
            if (activeTab) {
              const tabSlug = slugify(activeTab.title);
              window.history.replaceState(null, "", `/${tabSlug}`);
            }
          }
        }

        // Reset programmatic scroll flag
        if (isProgrammaticScroll.current) {
          setTimeout(() => {
            isProgrammaticScroll.current = false;
          }, 100);
        }

        // Simpler progress calculation
        const scrollY = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        setProgressToNext(Math.min(100, Math.max(0, progress)));
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [tabs, router]);

  return (
    <div className={styles.scrollProgress}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressToNext}%` }}
        />
      </div>
    </div>
  );
}
