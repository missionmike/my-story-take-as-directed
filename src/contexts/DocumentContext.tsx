"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { GoogleDocsContent } from "@/types/googleDocs";

interface DocumentContextType {
  document: GoogleDocsContent | null;
  loading: boolean;
  error: string | null;
  fetchDocument: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined,
);

interface DocumentProviderProps {
  children: ReactNode;
}

export function DocumentProvider({ children }: DocumentProviderProps) {
  const [document, setDocument] = useState<GoogleDocsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/document");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const doc = await response.json();
      setDocument(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching document:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  return (
    <DocumentContext.Provider
      value={{ document, loading, error, fetchDocument }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
}
