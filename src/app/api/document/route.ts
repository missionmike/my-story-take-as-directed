import { NextResponse } from "next/server";
import { google } from "googleapis";
import { GoogleDocsContent, GoogleDocsElement } from "@/types/googleDocs";

class GoogleDocsApiService {
  private docsId: string;
  private serviceAccountCredentials: Record<string, unknown>;

  constructor() {
    this.docsId = process.env.GOOGLE_DOCS_ID!;

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error("Missing required environment variable: GOOGLE_SERVICE_ACCOUNT_JSON");
    }

    try {
      this.serviceAccountCredentials = JSON.parse(serviceAccountJson);
    } catch {
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
        includeTabsContent: true,
      });

      const document = response.data;
      const title = document.title || "Untitled Document";

      const publishedTabs = (document.tabs || []).filter((tab) => !tab.tabProperties?.title.startsWith("D:"));

      return {
        title,
        content: "",
        tabs: publishedTabs.map((tab) => {
          const richContent = (tab.documentTab?.body?.content || []) as GoogleDocsElement[];
          return {
            title: tab.tabProperties?.title || "Untitled Tab",
            content: JSON.stringify(richContent),
            richContent: richContent,
          };
        }),
      };
    } catch (error) {
      console.error("Error fetching Google Doc:", error);
      throw new Error("Failed to fetch document from Google Docs API");
    }
  }
}

export async function GET() {
  try {
    const googleDocsService = new GoogleDocsApiService();
    const document = await googleDocsService.fetchDocument();

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch document",
      },
      { status: 500 },
    );
  }
}
