"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoogleDocsContent } from "@/types/googleDocs";
import { slugify } from "@/utils/urlUtils";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./FixedSidebar.module.scss";

interface FixedSidebarProps {
  document: GoogleDocsContent;
  isOpen?: boolean;
  onClose?: () => void;
}

export function FixedSidebar({ document, isOpen, onClose }: FixedSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
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
            const isActive = pathname === `/${tabSlug}`;

            return (
              <Link
                key={index}
                href={`/${tabSlug}`}
                className={`${styles.tabNavItem} ${isActive ? styles.active : ""}`}
                onClick={handleLinkClick}
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
