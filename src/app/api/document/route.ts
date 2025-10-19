import { NextResponse } from "next/server";
import { GoogleDocsService } from "@/services/googleDocsService";

export async function GET() {
  try {
    const googleDocsService = new GoogleDocsService();
    const document = await googleDocsService.fetchDocument();

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch document",
      },
      { status: 500 },
    );
  }
}
