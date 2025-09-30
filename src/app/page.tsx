"use client";

import { useState, useEffect } from "react";
import { GoogleDocsContent } from "@/types/googleDocs";
import ScrollProgress from "./components/ScrollProgress";
import FixedSidebar from "./components/FixedSidebar";
import MainContent from "./components/MainContent";
import styles from "./page.module.scss";

export default function HomePage() {
  const [document, setDocument] = useState<GoogleDocsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/document");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const doc = await response.json();
      setDocument(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching document:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p>Loading document...</p>
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
          <button onClick={fetchDocument} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>No Document Found</h2>
          <p className={styles.errorMessage}>Please check your configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ScrollProgress tabs={document.tabs} />

      <FixedSidebar document={document} />

      <MainContent document={document} />
    </div>
  );
}
