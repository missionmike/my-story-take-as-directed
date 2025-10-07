"use client";

import { useEffect, use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/contexts/DocumentContext";
import { findTabBySlug } from "@/utils/urlUtils";
import { MainContent } from "@/app/components/MainContent";
import { FixedSidebar } from "@/app/components/FixedSidebar";
import { ScrollProgress } from "@/app/components/ScrollProgress";
import { MobileMenuButton } from "@/app/components/MobileMenuButton";
import styles from "@/app/page.module.scss";

interface TabPageProps {
  params: Promise<{
    tabSlug: string;
  }>;
}

export default function TabPage({ params }: TabPageProps) {
  const { document, loading, error } = useDocument();
  const router = useRouter();
  const { tabSlug } = use(params);
  const hasScrolledRef = useRef(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isMobileMenuOpen) {
        window.document.body.style.overflow = "hidden";
      } else {
        window.document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        window.document.body.style.overflow = "";
      }
    };
  }, [isMobileMenuOpen]);

  // Validate tab slug exists and redirect if not found
  useEffect(() => {
    if (document && tabSlug) {
      const tabMatch = findTabBySlug(document.tabs, tabSlug);
      if (!tabMatch) {
        // Tab not found, redirect to home
        router.push("/");
      }
    }
  }, [document, tabSlug, router]);

  // Scroll to the specific tab only on initial page load (refresh)
  useEffect(() => {
    if (document && tabSlug && !hasScrolledRef.current) {
      const tabMatch = findTabBySlug(document.tabs, tabSlug);
      if (tabMatch) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const element = window.document.getElementById(
            `tab-${tabMatch.index}`,
          );
          if (element) {
            // Set programmatic scroll flag to prevent URL updates
            if (
              (
                window as Window & {
                  setProgrammaticScroll?: (value: boolean) => void;
                }
              ).setProgrammaticScroll
            ) {
              window.setProgrammaticScroll(true);
            }

            // Scroll to the element
            element.scrollIntoView({
              behavior: "instant", // Use instant to avoid animation
              block: "start",
            });

            hasScrolledRef.current = true;
          }
        });
      }
    }
  }, [document, tabSlug]);

  if (loading) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>Loading...</h2>
          <p className={styles.errorMessage}>
            Please wait while we load the document.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>Error</h2>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>No Document Found</h2>
          <p className={styles.errorMessage}>
            Please check your configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ScrollProgress tabs={document.tabs} />

      <MobileMenuButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />

      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu}></div>
      )}

      <FixedSidebar
        document={document}
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      <MainContent document={document} />
    </div>
  );
}
