"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GoogleDocsContent } from "@/types/googleDocs";

export default function HomePage() {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Document
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDocument}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Document Found
          </h2>
          <p className="text-gray-600">Please check your configuration.</p>
        </div>
      </div>
    );
  }

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
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-shadow-lg">
              {document.title}
            </h1>
            <button
              onClick={fetchDocument}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 hover:-translate-y-1"
            >
              Refresh
            </button>
          </header>

          {/* Document Overview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Document Overview</h2>
            <p className="text-lg opacity-90 leading-relaxed">
              This document contains {document.tabs.length} sections/tabs. Click
              on any tab below to view its content.
            </p>
          </div>

          {/* Tabs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {document.tabs.map((tab, index) => (
              <Link
                key={index}
                href={`/tab/${index}`}
                className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-gray-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 group"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {tab.title}
                  </h3>
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    #{index + 1}
                  </span>
                </div>
                <div className="text-gray-600 text-sm leading-relaxed">
                  {tab.content.length > 150
                    ? `${tab.content.substring(0, 150)}...`
                    : tab.content || "No content available"}
                </div>
              </Link>
            ))}
          </div>

          {/* No Tabs Message */}
          {document.tabs.length === 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">No tabs found</h3>
              <p className="text-lg opacity-90 leading-relaxed">
                The document doesn't contain any recognizable tabs. Make sure
                your Google Doc is formatted with clear section headers.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
