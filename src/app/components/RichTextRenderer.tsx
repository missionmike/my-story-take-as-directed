"use client";

import React from "react";
import { GoogleDocsElement, TextRun, Paragraph } from "@/types/googleDocs";
import styles from "./RichTextRenderer.module.scss";

interface RichTextRendererProps {
  content: GoogleDocsElement[];
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!content || !Array.isArray(content)) {
    return <div className={styles.noContent}>No content available</div>;
  }

  const renderTextRun = (textRun: TextRun) => {
    if (!textRun) return null;

    const { content: text, textStyle } = textRun;
    if (!text) return null;

    // Clean up text content (remove extra newlines and special characters)
    let cleanText = text.replace(/\n$/, "").replaceAll("", "");

    if (!cleanText) return null;

    // Apply text styling
    const style: React.CSSProperties = {};
    let className = styles.textRun;

    if (textStyle) {
      if (textStyle.bold) {
        className += ` ${styles.bold}`;
      }
      if (textStyle.italic) {
        className += ` ${styles.italic}`;
      }

      // Handle links
      if (textStyle.link?.url) {
        return (
          <a
            href={textStyle.link.url}
            className={`${className} ${styles.link}`}
            style={style}
            target="_blank"
            rel="noopener noreferrer"
          >
            {cleanText}
          </a>
        );
      }
    }

    return (
      <span className={className} style={style}>
        {cleanText}
      </span>
    );
  };

  const renderParagraph = (paragraph: Paragraph, index: number) => {
    if (!paragraph || !paragraph.elements) return null;

    const { elements, paragraphStyle } = paragraph;
    const namedStyleType = paragraphStyle?.namedStyleType;

    // Separate text elements from horizontal rules
    const textElements = elements.filter((element) => element.textRun);
    const horizontalRules = elements.filter(
      (element) => element.horizontalRule,
    );

    // Check if this paragraph starts with '>' (excerpt indicator)
    const isExcerpt =
      textElements.length > 0 &&
      textElements[0]?.textRun?.content?.trim().startsWith(">");

    // Render text elements
    const renderedTextElements = textElements
      .map((element) => {
        if (element.textRun) {
          // Remove the '>' prefix for excerpt paragraphs
          if (isExcerpt && element === textElements[0]) {
            const textRun = { ...element.textRun };
            if (textRun.content) {
              textRun.content = textRun.content.replace(/^>\s*/, "");
            }
            return renderTextRun(textRun);
          }
          return renderTextRun(element.textRun);
        }
        return null;
      })
      .filter(Boolean);

    // Render horizontal rules
    const renderedHorizontalRules = horizontalRules.map(
      (element, elementIndex) => (
        <hr
          key={`hr-${index}-${elementIndex}`}
          className={styles.horizontalRule}
        />
      ),
    );

    // Skip empty paragraphs (no text content)
    if (
      renderedTextElements.length === 0 &&
      renderedHorizontalRules.length === 0
    )
      return null;

    // Heading type configuration
    const headingConfig: Record<
      string,
      { styleClass: string; tag: React.ElementType }
    > = {
      HEADING_1: { styleClass: styles.heading1, tag: "h1" },
      HEADING_2: { styleClass: styles.heading2, tag: "h2" },
      HEADING_3: { styleClass: styles.heading3, tag: "h3" },
      HEADING_4: { styleClass: styles.heading4, tag: "h4" },
      HEADING_5: { styleClass: styles.heading5, tag: "h5" },
      HEADING_6: { styleClass: styles.heading6, tag: "h6" },
      SUBTITLE: { styleClass: styles.subtitle, tag: "h3" },
    };

    // Determine paragraph class and tag based on heading level
    let paragraphClass = styles.paragraph;
    let Tag: React.ElementType = "p";

    // Add excerpt class if this is an excerpt
    if (isExcerpt) {
      paragraphClass += ` ${styles.excerpt}`;
    }

    if (namedStyleType && headingConfig[namedStyleType]) {
      const config = headingConfig[namedStyleType];
      paragraphClass += ` ${config.styleClass}`;
      Tag = config.tag;
    } else if (
      namedStyleType?.includes("HEADING") ||
      paragraphStyle?.headingId
    ) {
      // Fallback for any other heading type
      paragraphClass += ` ${styles.heading}`;
      Tag = "h2";
    }

    // Add alignment class (but not for excerpts to maintain their styling)
    if (paragraphStyle?.alignment && !isExcerpt) {
      paragraphClass += ` ${styles[paragraphStyle.alignment.toLowerCase()]}`;
    }

    // If there are only horizontal rules, return them without a paragraph wrapper
    if (
      renderedTextElements.length === 0 &&
      renderedHorizontalRules.length > 0
    ) {
      return (
        <React.Fragment key={index}>{renderedHorizontalRules}</React.Fragment>
      );
    }

    // If there are text elements, wrap them in the appropriate tag
    const paragraphElement = React.createElement(
      Tag,
      { key: `p-${index}`, className: paragraphClass },
      ...renderedTextElements,
    );

    // If there are also horizontal rules, return both
    if (renderedHorizontalRules.length > 0) {
      return (
        <React.Fragment key={index}>
          {paragraphElement}
          {renderedHorizontalRules}
        </React.Fragment>
      );
    }

    return paragraphElement;
  };

  const renderContent = () => {
    return content
      .map((element, index) => {
        if (element.paragraph) {
          return renderParagraph(element.paragraph, index);
        }
        if (element.sectionBreak) {
          return <div key={index} className={styles.sectionBreak} />;
        }
        return null;
      })
      .filter(Boolean);
  };

  return <div className={styles.richTextContainer}>{renderContent()}</div>;
}
