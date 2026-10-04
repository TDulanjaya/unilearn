"use client";

import { useEffect, useState } from "react";
import { getToken } from "./auth";
import { refreshAccessToken, toApiUrl } from "./api";

// Files saved by our server live under this path
const DOWNLOAD_PATH = "/api/v1/files/download/";

// Event posters and profile photos can be loaded without login
const PUBLIC_PREFIXES = ["events_", "avatars_"];

export function isServerFile(url?: string | null): boolean {
  return !!url && url.includes(DOWNLOAD_PATH);
}

function isPublicServerFile(url: string): boolean {
  const name = url.substring(url.indexOf(DOWNLOAD_PATH) + DOWNLOAD_PATH.length);
  return PUBLIC_PREFIXES.some((p) => name.startsWith(p));
}

// Full URL for a file (adds the API address to "/api/v1/..." paths)
export function fileUrl(url?: string | null): string {
  if (!url) return "";
  if (isServerFile(url) && !url.startsWith("http")) return toApiUrl(url);
  return url;
}

// Download a protected file with the login token and return a local blob URL
export async function fetchFileBlobUrl(url: string): Promise<string> {
  const fullUrl = fileUrl(url);
  const doFetch = (token: string | null) =>
    fetch(fullUrl, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  let res = await doFetch(getToken());
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    res = await doFetch(newToken);
  }
  if (!res.ok) {
    throw new Error(res.status === 403 ? "You don't have access to this file." : "Could not load the file.");
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// Open a file in a new tab (works for protected server files too)
export async function openFile(url?: string | null): Promise<void> {
  if (!url) return;
  if (!isServerFile(url) || isPublicServerFile(url)) {
    window.open(fileUrl(url), "_blank", "noopener,noreferrer");
    return;
  }
  // Open the tab first so the browser doesn't block the pop-up
  const tab = window.open("", "_blank");
  try {
    const blobUrl = await fetchFileBlobUrl(url);
    if (tab) {
      tab.location.href = blobUrl;
    } else {
      window.location.href = blobUrl;
    }
  } catch (err: any) {
    if (tab) tab.close();
    alert(err?.message || "Could not open the file.");
  }
}

// Save a file to the computer
export async function downloadFile(url?: string | null, fileName?: string): Promise<void> {
  if (!url) return;
  try {
    const blobUrl =
      isServerFile(url) && !isPublicServerFile(url) ? await fetchFileBlobUrl(url) : fileUrl(url);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName || url.split("/").pop() || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // free the memory after the download starts
    if (blobUrl.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err: any) {
    alert(err?.message || "Could not download the file.");
  }
}

// For <iframe>/<img>: gives a URL that works even when the file needs login
export function useFileUrl(url?: string | null): { src: string; error: string | null } {
  const [src, setSrc] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let blobUrl = "";
    let cancelled = false;
    setError(null);

    if (!url) {
      setSrc("");
      return;
    }
    if (!isServerFile(url) || isPublicServerFile(url)) {
      setSrc(fileUrl(url));
      return;
    }

    setSrc("");
    fetchFileBlobUrl(url)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        blobUrl = u;
        setSrc(u);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Could not load the file.");
      });

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  return { src, error };
}
