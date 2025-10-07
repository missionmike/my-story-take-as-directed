"use client";

import { useDocument } from "@/contexts/DocumentContext";
import { DocumentLayout } from "./components/DocumentLayout";

export default function HomePage() {
  const { fetchDocument } = useDocument();

  return <DocumentLayout onRetry={fetchDocument} />;
}
