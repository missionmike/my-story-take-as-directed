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
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce the scroll handling
      scrollTimeoutRef.current = setTimeout(() => {
        let activeTabIndex = 0;
        let maxVisibleScore = 0;

        for (let i = 0; i < tabs.length; i++) {
          const element = window.document.getElementById(`tab-${i}`);
          if (element) {
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportCenter = viewportHeight / 2;

            // Calculate how much of the tab is visible
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(viewportHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

            // Calculate the percentage of the tab that's visible
            const tabHeight = rect.height;
            const visiblePercentage =
              tabHeight > 0 ? visibleHeight / tabHeight : 0;

            // Calculate distance from viewport center (closer to center = higher score)
            const tabCenter = rect.top + rect.height / 2;
            const distanceFromCenter = Math.abs(tabCenter - viewportCenter);
            const centerScore = Math.max(
              0,
              1 - distanceFromCenter / viewportHeight,
            );

            // Combined score: visibility percentage + center proximity
            // This prevents jumping between tabs that are equally visible
            const combinedScore = visiblePercentage * 0.7 + centerScore * 0.3;

            // Only consider tabs that are at least 20% visible
            if (visiblePercentage > 0.2 && combinedScore > maxVisibleScore) {
              maxVisibleScore = combinedScore;
              activeTabIndex = i;
            }
          }
        }

        // Only update if we have a significant change and it's not programmatic scrolling
        if (
          activeTabIndex !== lastActiveTabIndex.current &&
          !isProgrammaticScroll.current &&
          maxVisibleScore > 0.2 // Only switch if the new tab is significantly visible
        ) {
          lastActiveTabIndex.current = activeTabIndex;
          const activeTab = tabs[activeTabIndex];
          if (activeTab) {
            const tabSlug = slugify(activeTab.title);
            // Use shallow routing to update URL without page reload
            router.replace(`/${tabSlug}`, { scroll: false });
          }
        }

        // Reset programmatic scroll flag after a short delay
        if (isProgrammaticScroll.current) {
          setTimeout(() => {
            isProgrammaticScroll.current = false;
          }, 100);
        }

        // Calculate progress to next tab based on visible area
        if (activeTabIndex < tabs.length - 1) {
          const currentElement = window.document.getElementById(
            `tab-${activeTabIndex}`,
          );
          const nextElement = window.document.getElementById(
            `tab-${activeTabIndex + 1}`,
          );

          if (currentElement && nextElement) {
            const currentRect = currentElement.getBoundingClientRect();
            const nextRect = nextElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate how much of the current tab is visible
            const currentVisibleTop = Math.max(0, currentRect.top);
            const currentVisibleBottom = Math.min(
              viewportHeight,
              currentRect.bottom,
            );
            const currentVisibleHeight = Math.max(
              0,
              currentVisibleBottom - currentVisibleTop,
            );
            const currentVisiblePercentage =
              currentRect.height > 0
                ? currentVisibleHeight / currentRect.height
                : 0;

            // Calculate progress based on how much of the current tab is still visible
            // When the current tab is fully visible, progress is 0%
            // When the current tab is completely scrolled past, progress is 100%
            const progressToNextTab = Math.max(
              0,
              Math.min(1, 1 - currentVisiblePercentage),
            );

            setProgressToNext(progressToNextTab * 100);
          }
        } else {
          // Last tab - show full progress
          setProgressToNext(100);
        }
      }, 50); // 50ms debounce
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
