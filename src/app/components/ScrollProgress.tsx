"use client";

import { useState, useEffect } from "react";
import styles from "./ScrollProgress.module.scss";

interface ScrollProgressProps {
  tabs: Array<{ title: string; content: string }>;
}

export default function ScrollProgress({ tabs }: ScrollProgressProps) {
  const [progressToNext, setProgressToNext] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      let activeTabIndex = 0;
      for (let i = 0; i < tabs.length; i++) {
        const element = window.document.getElementById(`tab-${i}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            activeTabIndex = i;
          }
        }
      }

      // Calculate progress to next tab
      if (activeTabIndex < tabs.length - 1) {
        const currentElement = window.document.getElementById(`tab-${activeTabIndex}`);
        const nextElement = window.document.getElementById(`tab-${activeTabIndex + 1}`);

        if (currentElement && nextElement) {
          const currentRect = currentElement.getBoundingClientRect();
          const nextRect = nextElement.getBoundingClientRect();

          // Calculate how far through the current tab we are
          const currentTabHeight = currentElement.offsetHeight;
          const scrolledInCurrentTab = Math.max(0, -currentRect.top);

          // Calculate distance to next tab
          const distanceToNext = Math.max(0, nextRect.top - 100);
          const totalDistance = currentTabHeight + distanceToNext;
          const progressToNextTab = Math.min(1, scrolledInCurrentTab / totalDistance);

          setProgressToNext(progressToNextTab * 100);
        }
      } else {
        // Last tab - show full progress
        setProgressToNext(100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [tabs]);

  return (
    <div className={styles.scrollProgress}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressToNext}%` }} />
      </div>
    </div>
  );
}
