"use client";

import { useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/contexts/DocumentContext";
import { findTabBySlug } from "@/utils/urlUtils";
import { DocumentLayout } from "@/app/components/DocumentLayout";

interface TabPageClientProps {
  params: Promise<{
    tabSlug: string;
  }>;
}

export function TabPageClient({ params }: TabPageClientProps) {
  const { document } = useDocument();
  const router = useRouter();
  const { tabSlug } = use(params);
  const hasScrolledRef = useRef(false);

  // Validate tab slug exists and redirect if not found
  useEffect(() => {
    if (document && tabSlug) {
      const tabMatch = findTabBySlug(document.tabs, tabSlug);
      if (!tabMatch) {
        // Tab not found, redirect to home
        router.push("/");
      }
    }
  }, [document, tabSlug, router]);

  // Scroll to the specific tab only on initial page load (refresh)
  useEffect(() => {
    if (document && tabSlug && !hasScrolledRef.current) {
      const tabMatch = findTabBySlug(document.tabs, tabSlug);
      if (tabMatch) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const element = window.document.getElementById(
            `tab-${tabMatch.index}`,
          );
          if (element) {
            // Set programmatic scroll flag to prevent URL updates
            if (
              (
                window as Window & {
                  setProgrammaticScroll?: (value: boolean) => void;
                }
              ).setProgrammaticScroll
            ) {
              window.setProgrammaticScroll(true);
            }

            element.scrollIntoView({
              behavior: "instant", // Use instant to avoid animation
              block: "start",
            });

            hasScrolledRef.current = true;
          }
        });
      }
    }
  }, [document, tabSlug]);

  return <DocumentLayout />;
}


