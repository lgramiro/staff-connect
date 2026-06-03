import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get a working URL for a file in Supabase Storage.
 * Handles both full URLs (legacy) and storage paths (new private buckets).
 */
export const useSupabaseUrl = (pathOrUrl: string | null, bucket: string) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pathOrUrl) {
      setUrl(null);
      return;
    }

    // If it's a full external URL, use it directly
    if (pathOrUrl.startsWith('http')) {
      // Check if it's a Supabase public URL that might now be broken due to bucket being private
      // e.g. https://.../storage/v1/object/public/bucket/path
      if (pathOrUrl.includes('/storage/v1/object/public/')) {
        // Try to extract the path to get a signed URL instead
        const parts = pathOrUrl.split(`/public/${bucket}/`);
        if (parts.length > 1) {
          const path = parts[1];
          getSignedUrl(path);
          return;
        }
      }
      setUrl(pathOrUrl);
      return;
    }

    // Otherwise, assume it's a storage path
    getSignedUrl(pathOrUrl);

    async function getSignedUrl(path: string) {
      setLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600);

        if (!error && data) {
          setUrl(data.signedUrl);
        } else {
          console.error(`Error generating signed URL for ${bucket}/${path}:`, error);
        }
      } catch (err) {
        console.error('Unexpected error in useSupabaseUrl:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [pathOrUrl, bucket]);

  return { url, loading };
};
