export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  fontSize?: {
    magnitude: number;
    unit: string;
  };
  weightedFontFamily?: {
    fontFamily: string;
    weight: number;
  };
}

export interface TextRun {
  content?: string;
  textStyle?: TextStyle;
}

export interface HorizontalRule {
  textStyle?: TextStyle;
}

export interface ParagraphElement {
  textRun?: TextRun;
  horizontalRule?: HorizontalRule;
}

export interface ParagraphStyle {
  namedStyleType?: string;
  headingId?: string;
  alignment?: string;
  lineSpacing?: number;
  direction?: string;
  spaceAbove?: { unit: string };
  spaceBelow?: { unit: string; magnitude?: number };
}

export interface Paragraph {
  elements: ParagraphElement[];
  paragraphStyle?: ParagraphStyle;
}

export interface GoogleDocsElement {
  startIndex?: number;
  endIndex?: number;
  paragraph?: Paragraph;
  sectionBreak?: Record<string, unknown>;
}

export interface GoogleDocsContent {
  title: string;
  content: string;
  tabs: Array<{
    title: string;
    content: string;
    richContent?: GoogleDocsElement[]; // Rich text data from Google Docs API
  }>;
}
