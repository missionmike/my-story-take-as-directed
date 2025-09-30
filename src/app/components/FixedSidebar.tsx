"use client";

import Link from "next/link";
import { GoogleDocsContent } from "@/types/googleDocs";
import styles from "./FixedSidebar.module.scss";

interface FixedSidebarProps {
  document: GoogleDocsContent;
}

export default function FixedSidebar({ document }: FixedSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.logo}>
          Take As Directed
        </Link>
      </div>

      <div className={styles.sidebarContent}>
        <h3 className={styles.sidebarTitle}>Table of Contents</h3>
        <nav className={styles.tabNavigation}>
          {document.tabs.map((tab, index) => (
            <a key={index} href={`#tab-${index}`} className={styles.tabNavItem}>
              <span className={styles.tabNumber}>#{index + 1}</span>
              <span className={styles.tabTitle}>{tab.title}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
