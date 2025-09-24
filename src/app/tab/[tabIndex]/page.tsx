"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleDocsContent } from "@/types/googleDocs";

export default function TabPage() {
  const params = useParams();
  const router = useRouter();
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
          errorData.error || `HTTP error! status: ${response.status}`
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Document
          </h2>
          <p className="text-gray-600 mb-6">{error || "Document not found"}</p>
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-1 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const index = parseInt((params.tabIndex as string) || "0", 10);
  const tab = document.tabs[index];

  if (!tab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Tab Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested tab does not exist.
          </p>
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-1 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const goToPreviousTab = () => {
    if (index > 0) {
      router.push(`/tab/${index - 1}`);
    }
  };

  const goToNextTab = () => {
    if (index < document.tabs.length - 1) {
      router.push(`/tab/${index + 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              Take As Directed
            </Link>
            <div className="flex space-x-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-white">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <button
              onClick={goToPreviousTab}
              disabled={index === 0}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              ← Previous
            </button>

            <Link
              href="/"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 hover:-translate-y-1"
            >
              ← Back to Home
            </Link>

            <button
              onClick={goToNextTab}
              disabled={index === document.tabs.length - 1}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Next →
            </button>
          </div>

          {/* Tab Info */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-shadow-lg">
              {tab.title}
            </h1>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              Tab {index + 1} of {document.tabs.length}
            </span>
          </div>

          {/* Tab Content */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 mb-8 shadow-2xl">
            <div className="text-gray-800">
              {tab.content ? (
                <div className="prose prose-lg max-w-none">
                  {tab.content
                    .split("\n")
                    .map((line: string, lineIndex: number) => (
                      <p key={lineIndex} className="mb-4 last:mb-0">
                        {line}
                      </p>
                    ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 italic py-8">
                  <p>No content available for this tab.</p>
                </div>
              )}
            </div>
          </div>

          {/* Tab List */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <h4 className="text-xl font-bold mb-6">All Tabs:</h4>
            <div className="flex flex-wrap gap-3 justify-center">
              {document.tabs.map(
                (
                  tabItem: GoogleDocsContent["tabs"][0],
                  tabItemIndex: number
                ) => (
                  <Link
                    key={tabItemIndex}
                    href={`/tab/${tabItemIndex}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-1 ${
                      tabItemIndex === index
                        ? "bg-white/90 text-gray-800 font-semibold"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {tabItem.title}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
