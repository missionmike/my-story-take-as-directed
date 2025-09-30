"use client";

import { GoogleDocsContent } from "@/types/googleDocs";
import RichTextRenderer from "./RichTextRenderer";
import styles from "./MainContent.module.scss";

interface MainContentProps {
  document: GoogleDocsContent;
}

export default function MainContent({ document }: MainContentProps) {
  return (
    <div className={styles.mainContent}>
      {/* Document Title */}
      <header className={styles.header}>
        <h1 className={styles.title}>{document.title}</h1>
      </header>

      <div className={styles.bookContent}>
        {document.tabs.map((tab, index) => (
          <section key={index} id={`tab-${index}`} className={styles.tabSection}>
            <div className={styles.tabContent}>
              {tab.richContent ? (
                <RichTextRenderer content={tab.richContent} />
              ) : tab.content ? (
                <div className="prose prose-lg max-w-none">
                  {tab.content.split("\n").map((line: string, lineIndex: number) => (
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
          </section>
        ))}
      </div>
    </div>
  );
}
