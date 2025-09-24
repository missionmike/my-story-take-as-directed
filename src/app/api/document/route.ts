import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import type { GoogleDocsContent } from "@/types/googleDocs";

class GoogleDocsApiService {
  private docsId: string;
  private serviceAccountCredentials: any;

  constructor() {
    this.docsId = process.env.GOOGLE_DOCS_ID!;

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error(
        "Missing required environment variable: GOOGLE_SERVICE_ACCOUNT_JSON"
      );
    }

    try {
      this.serviceAccountCredentials = JSON.parse(serviceAccountJson);
    } catch (error) {
      throw new Error("Invalid service account JSON format");
    }

    if (!this.docsId) {
      throw new Error("Missing required environment variable: GOOGLE_DOCS_ID");
    }
  }

  async fetchDocument(): Promise<GoogleDocsContent> {
    try {
      // Use service account for private documents
      const auth = new google.auth.GoogleAuth({
        credentials: this.serviceAccountCredentials,
        scopes: ["https://www.googleapis.com/auth/documents.readonly"],
      });

      const docs = google.docs({ version: "v1", auth });

      const response = await docs.documents.get({
        documentId: this.docsId,
      });

      const document = response.data;
      const title = document.title || "Untitled Document";

      // Parse the document content to extract tabs
      const tabs = this.parseDocumentTabs(document);

      return {
        title,
        content: this.extractTextContent(document),
        tabs,
      };
    } catch (error) {
      console.error("Error fetching Google Doc:", error);
      throw new Error("Failed to fetch document from Google Docs API");
    }
  }

  private extractTextContent(document: any): string {
    if (!document.body?.content) return "";

    return document.body.content
      .map((element: any) => {
        if (element.paragraph) {
          return (
            element.paragraph.elements
              ?.map((elem: any) => elem.textRun?.content || "")
              .join("") || ""
          );
        }
        return "";
      })
      .join("\n")
      .trim();
  }

  private parseDocumentTabs(
    document: any
  ): Array<{ title: string; content: string }> {
    const tabs: Array<{ title: string; content: string }> = [];

    if (!document.body?.content) return tabs;

    let currentTab: { title: string; content: string } | null = null;
    let currentContent: string[] = [];

    for (const element of document.body.content) {
      if (element.paragraph) {
        const text =
          element.paragraph.elements
            ?.map((elem: any) => elem.textRun?.content || "")
            .join("") || "";

        // Check if this looks like a tab header (you can customize this logic)
        if (this.isTabHeader(text)) {
          // Save previous tab if exists
          if (currentTab) {
            currentTab.content = currentContent.join("\n").trim();
            tabs.push(currentTab);
          }

          // Start new tab
          currentTab = {
            title: text.trim(),
            content: "",
          };
          currentContent = [];
        } else if (currentTab) {
          currentContent.push(text);
        }
      }
    }

    // Add the last tab
    if (currentTab) {
      currentTab.content = currentContent.join("\n").trim();
      tabs.push(currentTab);
    }

    return tabs;
  }

  private isTabHeader(text: string): boolean {
    // Customize this logic based on how your Google Doc tabs are formatted
    // This example looks for text that's all caps, starts with a number, or contains specific keywords
    const trimmed = text.trim();
    return (
      trimmed.length > 0 &&
      (/^[A-Z\s]+$/.test(trimmed) || // All caps
        /^\d+\.\s/.test(trimmed) || // Starts with number
        /^(TAB|SECTION|CHAPTER|PART)\s/i.test(trimmed)) // Contains tab keywords
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const googleDocsService = new GoogleDocsApiService();
    const document = await googleDocsService.fetchDocument();

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch document",
      },
      { status: 500 }
    );
  }
}
