"use client";

import Link from "next/link";
import { GoogleDocsContent } from "@/types/googleDocs";
import { slugify } from "@/utils/urlUtils";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./FixedSidebar.module.scss";

interface FixedSidebarProps {
  document: GoogleDocsContent;
}

export function FixedSidebar({ document }: FixedSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.logo}>
          {document.title}
        </Link>
      </div>

      <div className={styles.sidebarContent}>
        <h3 className={styles.sidebarTitle}>Table of Contents</h3>
        <nav className={styles.tabNavigation}>
          {document.tabs.map((tab, index) => {
            const tabSlug = slugify(tab.title);
            return (
              <Link
                key={index}
                href={`/${tabSlug}`}
                className={styles.tabNavItem}
              >
                <span className={styles.tabTitle}>{tab.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.sidebarFooter}>
        <ThemeToggle />
      </div>
    </div>
  );
}
