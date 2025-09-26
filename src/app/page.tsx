"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GoogleDocsContent } from "@/types/googleDocs";
import TabLayout from "./components/TabLayout";
import styles from "./page.module.scss";

export default function HomePage() {
  const [document, setDocument] = useState<GoogleDocsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/document");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
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
          <p className={styles.errorMessage}>
            Please check your configuration.
          </p>
        </div>
      </div>
    );
  }

  const currentTab = document.tabs[currentTabIndex];

  return (
    <TabLayout
      document={document}
      currentTabIndex={currentTabIndex}
      onTabChange={setCurrentTabIndex}
    >
      <div className={styles.homeContent}>
        {currentTab ? (
          <div className={styles.tabContent}>
            <div className={styles.tabInfo}>
              <h2 className={`${styles.tabTitle} text-shadow-lg`}>
                {currentTab.title}
              </h2>
            </div>

            <div className={styles.tabContentCard}>
              <div className={styles.contentText}>
                {currentTab.content ? (
                  <div className="prose prose-lg max-w-none">
                    {currentTab.content
                      .split("\n")
                      .map((line: string, lineIndex: number) => (
                        <p key={lineIndex} className="mb-4 last:mb-0">
                          {line}
                        </p>
                      ))}
                  </div>
                ) : (
                  <div className={styles.noContent}>
                    <p>No content available for this tab.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noTabsMessage}>
            <h3 className={styles.noTabsTitle}>No tabs found</h3>
            <p className={styles.noTabsText}>
              The document doesn't contain any recognizable tabs. Make sure your
              Google Doc is formatted with clear section headers.
            </p>
          </div>
        )}
      </div>
    </TabLayout>
  );
}
