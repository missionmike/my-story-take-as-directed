"use client";

import React from "react";
import { GoogleDocsElement, TextRun, Paragraph } from "@/types/googleDocs";
import styles from "./RichTextRenderer.module.scss";

interface RichTextRendererProps {
  content: GoogleDocsElement[];
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!content || !Array.isArray(content)) {
    return <div className={styles.noContent}>No content available</div>;
  }

  const renderTextRun = (textRun: TextRun) => {
    if (!textRun) return null;

    const { content: text, textStyle } = textRun;
    if (!text) return null;

    // Clean up text content (remove extra newlines)
    const cleanText = text.replace(/\n$/, "");

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
      if (textStyle.fontSize) {
        style.fontSize = `${textStyle.fontSize.magnitude}pt`;
      }
      if (textStyle.weightedFontFamily) {
        style.fontFamily = textStyle.weightedFontFamily.fontFamily;
        style.fontWeight = textStyle.weightedFontFamily.weight;
      }
    }

    return (
      <span key={Math.random()} className={className} style={style}>
        {cleanText}
      </span>
    );
  };

  const renderParagraph = (paragraph: Paragraph, index: number) => {
    if (!paragraph || !paragraph.elements) return null;

    const { elements, paragraphStyle } = paragraph;
    const namedStyleType = paragraphStyle?.namedStyleType;

    // Determine if this is a heading
    const isHeading =
      namedStyleType?.includes("HEADING") || paragraphStyle?.headingId;
    const isSubtitle = namedStyleType === "SUBTITLE";

    // Separate text elements from horizontal rules
    const textElements = elements.filter((element) => element.textRun);
    const horizontalRules = elements.filter(
      (element) => element.horizontalRule,
    );

    // Render text elements
    const renderedTextElements = textElements
      .map((element, elementIndex) => {
        if (element.textRun) {
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

    // Determine paragraph class and tag
    let paragraphClass = styles.paragraph;
    let Tag: React.ElementType = "p";

    if (isHeading) {
      paragraphClass += ` ${styles.heading}`;
      Tag = "h1";
    } else if (isSubtitle) {
      paragraphClass += ` ${styles.subtitle}`;
      Tag = "h2";
    }

    // Add alignment class
    if (paragraphStyle?.alignment) {
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
