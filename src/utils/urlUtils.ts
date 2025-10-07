/**
 * Converts a tab title to a URL-friendly slug
 *
 * @param title - The tab title to slugify
 * @returns A URL-friendly slug
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Finds a tab by its slugified title
 *
 * @param tabs - Array of tabs
 * @param slug - The slug to match against
 * @returns The matching tab and its index, or null if not found
 */
export function findTabBySlug(
  tabs: Array<{ title: string; content: string; richContent?: unknown[] }>,
  slug: string,
) {
  for (let i = 0; i < tabs.length; i++) {
    if (slugify(tabs[i].title) === slug) {
      return { tab: tabs[i], index: i };
    }
  }
  return null;
}
