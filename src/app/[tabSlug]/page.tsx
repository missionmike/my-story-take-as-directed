import { Metadata } from "next";
import { TabPageClient } from "@/app/components/TabPageClient";
import { GoogleDocsContent } from "@/types/googleDocs";
import { findTabBySlug } from "@/utils/urlUtils";
import { GoogleDocsService } from "@/services/googleDocsService";

interface TabPageProps {
  params: Promise<{
    tabSlug: string;
  }>;
}

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
 * Generate metadata based on frontmatter
 */
export async function generateMetadata({
  params,
}: TabPageProps): Promise<Metadata> {
  const { tabSlug } = await params;
  const document = await fetchDocument();

  if (!document) {
    return {
      title: "Document Not Found",
    };
  }

  const tabMatch = findTabBySlug(document.tabs, tabSlug);

  if (!tabMatch) {
    return {
      title: "Tab Not Found",
    };
  }

  const tab = document.tabs[tabMatch.index];
  const frontMatter = tab.frontMatter;

  // Use frontmatter data if available, otherwise use defaults
  const title = frontMatter?.title || tab.title || document.title;
  const description = frontMatter?.description;
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

export default function TabPage({ params }: TabPageProps) {
  return <TabPageClient params={params} />;
}
