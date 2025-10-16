import { GoogleDocsElement } from "@/types/googleDocs";

export interface FrontMatterData {
  title?: string;
  author?: string;
  date?: string;
  published?: boolean;
  description?: string;
  featuredImage?: string;
  [key: string]: string | boolean | undefined;
}

/**
 * Extracts text content from Google Docs elements
 */
function extractTextContent(elements: GoogleDocsElement[]): string {
  return elements
    .map((element) => {
      if (element.paragraph?.elements) {
        return element.paragraph.elements
          .map((e) => e.textRun?.content || "")
          .join("");
      }
      return "";
    })
    .join("\n");
}

/**
 * Parses frontmatter from Google Docs content
 * Extracts raw text content between --- delimiters (standard YAML frontmatter)
 */
export function parseFrontMatter(content: GoogleDocsElement[]): {
  frontMatter: FrontMatterData | null;
  contentWithoutFrontMatter: GoogleDocsElement[];
} {
  if (!content || content.length === 0) {
    return { frontMatter: null, contentWithoutFrontMatter: content };
  }

  // Extract text from the beginning of the document
  let textContent = extractTextContent(content);

  // Remove any leading code block markers or special characters
  textContent = textContent.trim();

  // Remove the Google Docs code block marker character (0xE907)
  if (textContent.charCodeAt(0) === 0xe907) {
    textContent = textContent.substring(1).trim();
  }

  // Check if content starts with frontmatter delimiter
  if (!textContent.startsWith("---")) {
    return { frontMatter: null, contentWithoutFrontMatter: content };
  }

  // Find the closing delimiter
  const lines = textContent.split("\n");
  let closingDelimiterIndex = -1;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      closingDelimiterIndex = i - 1;
      break;
    }
  }

  if (closingDelimiterIndex === -1) {
    // No closing delimiter found, treat as regular content
    return { frontMatter: null, contentWithoutFrontMatter: content };
  }

  // Extract raw text content between delimiters
  const frontMatterLines = lines.slice(1, closingDelimiterIndex);

  const frontMatter: FrontMatterData = {};

  // Parse YAML-like key-value pairs from raw text
  for (const line of frontMatterLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const colonIndex = trimmedLine.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmedLine.substring(0, colonIndex).trim();
    let value = trimmedLine.substring(colonIndex + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Parse value types
    if (value.toLowerCase() === "true") {
      frontMatter[key] = true;
    } else if (value.toLowerCase() === "false") {
      frontMatter[key] = false;
    } else {
      frontMatter[key] = value;
    }
  }

  // Calculate how many characters to skip to remove frontmatter
  // Include the original leading whitespace and code block markers
  const frontMatterText = lines.slice(0, closingDelimiterIndex + 1).join("\n");
  let charsToSkip = frontMatterText.length;

  // Remove frontmatter from content
  const contentWithoutFrontMatter = removeLeadingCharacters(
    content,
    charsToSkip,
  );

  return {
    frontMatter: Object.keys(frontMatter).length > 0 ? frontMatter : null,
    contentWithoutFrontMatter,
  };
}

/**
 * Removes the first N characters from Google Docs elements
 */
function removeLeadingCharacters(
  elements: GoogleDocsElement[],
  charCount: number,
): GoogleDocsElement[] {
  const result: GoogleDocsElement[] = [];
  let remainingChars = charCount;

  for (const element of elements) {
    if (remainingChars <= 0) {
      result.push(element);
      continue;
    }

    if (element.paragraph?.elements) {
      const newParagraphElements = [];
      let paragraphEmpty = true;

      for (const paragraphElement of element.paragraph.elements) {
        if (remainingChars <= 0) {
          newParagraphElements.push(paragraphElement);
          paragraphEmpty = false;
          continue;
        }

        if (paragraphElement.textRun?.content) {
          const content = paragraphElement.textRun.content;
          if (content.length <= remainingChars) {
            remainingChars -= content.length;
          } else {
            // Keep the part after the frontmatter
            const newContent = content.substring(remainingChars);
            remainingChars = 0;
            if (newContent.trim()) {
              newParagraphElements.push({
                ...paragraphElement,
                textRun: {
                  ...paragraphElement.textRun,
                  content: newContent,
                },
              });
              paragraphEmpty = false;
            }
          }
        } else {
          newParagraphElements.push(paragraphElement);
          paragraphEmpty = false;
        }
      }

      // Only add paragraph if it has content
      if (!paragraphEmpty && newParagraphElements.length > 0) {
        result.push({
          ...element,
          paragraph: {
            ...element.paragraph,
            elements: newParagraphElements,
          },
        });
      }
    } else {
      result.push(element);
    }
  }

  return result;
}
