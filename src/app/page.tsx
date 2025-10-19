import { Metadata } from "next";
import { HomePageClient } from "./components/HomePageClient";
import { GoogleDocsContent } from "@/types/googleDocs";
import { GoogleDocsService } from "@/services/googleDocsService";

/**
 * Fetch document data server-side for metadata generation
 */
async function fetchDocument(): Promise<GoogleDocsContent | null> {
  try {
    const googleDocsService = new GoogleDocsService();
    const document = await googleDocsService.fetchDocument();
    return document;
  } catch (error) {
    console.error("Error fetching document for metadata:", error);
    return null;
  }
}

/**
 * Generate metadata based on the first tab's frontmatter
 */
export async function generateMetadata(): Promise<Metadata> {
  const document = await fetchDocument();

  if (!document || !document.tabs || document.tabs.length === 0) {
    return {
      title: process.env.SITE_TITLE || "Document",
      description: process.env.SITE_DESCRIPTION,
    };
  }

  // Use the first tab for home page metadata
  const firstTab = document.tabs[0];
  const frontMatter = firstTab.frontMatter;

  console.log(frontMatter);
  // Use frontmatter data if available, otherwise use defaults
  const title =
    frontMatter?.title ||
    document.title ||
    process.env.SITE_TITLE ||
    "Document";
  const description = frontMatter?.description || process.env.SITE_DESCRIPTION;
  const author = frontMatter?.author;
  const featuredImage = frontMatter?.featuredImage;

  const metadata: Metadata = {
    title,
    description,
  };

  if (author) {
    metadata.authors = [{ name: author }];
  }

  if (featuredImage) {
    metadata.openGraph = {
      title,
      description,
      images: [featuredImage],
    };
    metadata.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [featuredImage],
    };
  }

  return metadata;
}

export default function HomePage() {
  return <HomePageClient />;
}
