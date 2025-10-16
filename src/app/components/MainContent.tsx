"use client";

import { GoogleDocsContent } from "@/types/googleDocs";
import { RichTextRenderer } from "./RichTextRenderer";
import styles from "./MainContent.module.scss";
import Image from "next/image";

interface MainContentProps {
  document: GoogleDocsContent;
}

export function MainContent({ document }: MainContentProps) {
  return (
    <div className={styles.mainContent}>
      <header className={styles.header}>
        <h1 className={styles.title}>{document.title}</h1>
        {process.env.NEXT_PUBLIC_BOOK_AUTHOR && (
          <p className={styles.subtitle}>
            <em>by {process.env.NEXT_PUBLIC_BOOK_AUTHOR}</em>
          </p>
        )}
      </header>

      <div className={styles.bookContent}>
        {document.tabs.map((tab, index) => (
          <section
            key={index}
            id={`tab-${index}`}
            className={styles.tabSection}
          >
            <div className={styles.tabContent}>
              {tab?.frontMatter?.featuredImage && (
                <Image
                  src={`/${tab.frontMatter.featuredImage}`}
                  alt={tab.title}
                  className={styles.featuredImage}
                  width={1000}
                  height={500}
                  layout="responsive"
                />
              )}
              {tab.richContent ? (
                <RichTextRenderer content={tab.richContent} />
              ) : tab.content ? (
                <div className="prose prose-lg max-w-none">
                  {tab.content
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
          </section>
        ))}
      </div>
    </div>
  );
}
