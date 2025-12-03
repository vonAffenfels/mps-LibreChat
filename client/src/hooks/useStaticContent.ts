import { useState, useCallback } from 'react';

/**
 * Hook to load and cache static content files (e.g., markdown files)
 *
 * @param path - The path to the static content file (e.g., '/static/impressum.md')
 * @returns Object containing content, loading state, error state, and loadContent function
 */
export const useStaticContent = (path: string) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadContent = useCallback(() => {
    if (content) {
      return; // Already loaded
    }

    setLoading(true);
    setError(false);

    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load content from ${path}`);
        }
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load content from ${path}:`, err);
        setError(true);
        setLoading(false);
      });
  }, [content, path]);

  return { content, loading, error, loadContent };
};
