"use client";

import { useDocument } from "@/contexts/DocumentContext";
import { DocumentLayout } from "./DocumentLayout";

export function HomePageClient() {
  const { fetchDocument } = useDocument();

  return <DocumentLayout onRetry={fetchDocument} />;
}
