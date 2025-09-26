"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleDocsContent } from "@/types/googleDocs";
import styles from "./TabLayout.module.scss";

interface TabLayoutProps {
  document: GoogleDocsContent;
  children: React.ReactNode;
  currentTabIndex?: number;
  onTabChange?: (index: number) => void;
}

export default function TabLayout({
  document,
  children,
  currentTabIndex: propCurrentTabIndex,
  onTabChange,
}: TabLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const urlTabIndex = parseInt((params.tabIndex as string) || "0", 10);
  const currentTabIndex =
    propCurrentTabIndex !== undefined ? propCurrentTabIndex : urlTabIndex;
  const isHomePage = !params.tabIndex;

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTabIndex(currentTabIndex);
  }, [currentTabIndex]);

  // Handle scroll detection for automatic tab switching
  const handleScroll = useCallback(() => {
    if (!contentRef.current || isScrolling || isHomePage || isTransitioning)
      return;

    const element = contentRef.current;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

    // Update scroll progress for visual indicator
    setScrollProgress(Math.min(100, scrollPercentage * 100));

    // Debug logging
    console.log("Scroll detection:", {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollPercentage,
      currentTabIndex,
      tabsLength: document.tabs.length,
      isScrolling,
      isTransitioning,
    });

    // Check if we're near the bottom using multiple methods
    const isNearBottom =
      scrollPercentage >= 0.85 || scrollTop + clientHeight >= scrollHeight - 50; // Within 50px of bottom

    if (isNearBottom && currentTabIndex < document.tabs.length - 1) {
      console.log("Triggering next tab transition");
      setIsScrolling(true);
      setIsTransitioning(true);

      if (onTabChange) {
        // Homepage mode - update state
        onTabChange(currentTabIndex + 1);
      } else {
        // Individual tab page mode - navigate to URL
        router.push(`/tab/${currentTabIndex + 1}`);
      }

      // Reset scrolling flag after transition
      setTimeout(() => {
        setIsScrolling(false);
        setIsTransitioning(false);
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      }, 800); // Longer transition time to match background animation
    }
  }, [
    currentTabIndex,
    document.tabs.length,
    router,
    isScrolling,
    isHomePage,
    onTabChange,
    isTransitioning,
  ]);

  // Handle scroll events
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    console.log("Setting up scroll listener for element:", element);

    const scrollHandler = (e: Event) => {
      console.log("Scroll event triggered");
      handleScroll();
    };

    element.addEventListener("scroll", scrollHandler, { passive: true });

    return () => {
      console.log("Removing scroll listener");
      element.removeEventListener("scroll", scrollHandler);
    };
  }, [handleScroll]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowRight" &&
        currentTabIndex < document.tabs.length - 1
      ) {
        if (onTabChange) {
          onTabChange(currentTabIndex + 1);
        } else {
          router.push(`/tab/${currentTabIndex + 1}`);
        }
      } else if (e.key === "ArrowLeft" && currentTabIndex > 0) {
        if (onTabChange) {
          onTabChange(currentTabIndex - 1);
        } else {
          router.push(`/tab/${currentTabIndex - 1}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTabIndex, document.tabs.length, router, onTabChange]);

  const goToTab = (index: number) => {
    setIsScrolling(true);
    setIsTransitioning(true);

    if (onTabChange) {
      // Homepage mode - update state
      onTabChange(index);
    } else {
      // Individual tab page mode - navigate to URL
      router.push(`/tab/${index}`);
    }

    setSidebarOpen(false);

    setTimeout(() => {
      setIsScrolling(false);
      setIsTransitioning(false);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, 800);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Generate background gradient based on current tab
  const getBackgroundStyle = () => {
    const gradients = [
      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", // Default purple
      "linear-gradient(135deg, #059669 0%, #10b981 100%)", // Green
      "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)", // Red
      "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", // Orange
      "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", // Purple
      "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)", // Cyan
      "linear-gradient(135deg, #be185d 0%, #ec4899 100%)", // Pink
      "linear-gradient(135deg, #65a30d 0%, #84cc16 100%)", // Lime
    ];

    const gradientIndex = currentTabIndex % gradients.length;
    return gradients[gradientIndex];
  };

  return (
    <div
      className={styles.container}
      style={{ background: getBackgroundStyle() }}
    >
      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            Take As Directed
          </Link>
          <button
            className={styles.closeButton}
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <div className={styles.sidebarContent}>
          <h3 className={styles.sidebarTitle}>Table of Contents</h3>
          <nav className={styles.tabNavigation}>
            {/* Home Link */}
            <Link
              href="/"
              className={`${styles.tabNavItem} ${
                isHomePage ? styles.tabNavItemActive : ""
              }`}
            >
              <span className={styles.tabNumber}>🏠</span>
              <span className={styles.tabTitle}>Home</span>
            </Link>

            {/* Tab Links */}
            {document.tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => goToTab(index)}
                className={`${styles.tabNavItem} ${
                  index === currentTabIndex ? styles.tabNavItemActive : ""
                }`}
              >
                <span className={styles.tabNumber}>#{index + 1}</span>
                <span className={styles.tabTitle}>{tab.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Navigation */}
        <nav className={styles.topNav}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            ☰ Menu
          </button>
          <div className={styles.navControls}>
            <button
              onClick={() => goToTab(Math.max(0, currentTabIndex - 1))}
              disabled={currentTabIndex === 0}
              className={styles.navButton}
            >
              ← Previous
            </button>
            <span className={styles.tabCounter}>
              {currentTabIndex + 1} of {document.tabs.length}
            </span>
            <button
              onClick={() =>
                goToTab(Math.min(document.tabs.length - 1, currentTabIndex + 1))
              }
              disabled={currentTabIndex === document.tabs.length - 1}
              className={styles.navButton}
            >
              Next →
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <div
          ref={contentRef}
          className={`${styles.contentArea} ${
            isTransitioning ? styles.transitioning : ""
          }`}
        >
          {children}
        </div>

        {/* Scroll Progress Indicator */}
        <div className={styles.scrollProgress}>
          <div
            className={styles.scrollProgressBar}
            style={{
              width: `${scrollProgress}%`,
            }}
          ></div>
        </div>

        {/* Transition Overlay */}
        {isTransitioning && (
          <div className={styles.transitionOverlay}>
            <div className={styles.transitionSpinner}></div>
            <p className={styles.transitionText}>Loading next tab...</p>
          </div>
        )}
      </div>
    </div>
  );
}
