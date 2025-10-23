"use client";

import { useState, useEffect, ReactNode } from "react";
import { useDocument } from "@/contexts/DocumentContext";
import { ScrollProgress } from "./ScrollProgress";
import { FixedSidebar } from "./FixedSidebar";
import { MainContent } from "./MainContent";
import { MobileMenuButton } from "./MobileMenuButton";
import styles from "../page.module.scss";

interface DocumentLayoutProps {
  children?: ReactNode;
  onRetry?: () => void;
}

export function DocumentLayout({ children, onRetry }: DocumentLayoutProps) {
  const { document, loading, error } = useDocument();
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>Error Loading Document</h2>
          <p className={styles.errorMessage}>{error}</p>
          {onRetry && (
            <button onClick={onRetry} className={styles.retryButton}>
              Try Again
            </button>
          )}
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

      {children}
    </div>
  );
}
