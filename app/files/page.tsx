"use client";

import { useEffect, useState } from "react";
import styles from "./files.module.css";

type FileEntry = { key: string; name: string; size: number; updatedAt: string | null; url: string };
type FolderEntry = { name: string; path: string; url: string };
type Library = { folder: string; folders: FolderEntry[]; files: FileEntry[] };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const [library, setLibrary] = useState<Library>({ folder: "", folders: [], files: [] });
  const [status, setStatus] = useState("Loading files...");

  useEffect(() => {
    const folder = new URLSearchParams(window.location.search).get("folder") || "";
    fetch(`/api/files/list?folder=${encodeURIComponent(folder)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setLibrary(data);
        setStatus("");
      })
      .catch((error: Error) => setStatus(error.message || "The file library is unavailable."));
  }, []);

  const parent = library.folder.split("/").slice(0, -1).join("/");
  const folderLabel = library.folder ? library.folder.split("/").join(" / ") : "All files";

  return <main className={styles.page}>
    <header className={styles.header}>
      <a className={styles.brand} href="/" aria-label="Le Quang Anh home">LA<sup>&reg;</sup></a>
      <a className={styles.adminLink} href="/files/admin">Manage files <span className={styles.arrow} aria-hidden="true" /></a>
    </header>
    <section className={styles.intro}>
      <p className={styles.eyebrow}>Le Quang Anh / File library</p>
      <h1>{library.folder ? <><span className={styles.folderTitle}>{folderLabel}</span><br /><em>project files.</em></> : <>Selected files,<br /><em>ready to share.</em></>}</h1>
      <p>{library.folder ? "A collection of documents from this project." : "Research papers, professional documents and supporting material."}</p>
    </section>
    <section className={styles.list} aria-live="polite">
      {library.folder && <a className={styles.backLink} href={parent ? `/files?folder=${encodeURIComponent(parent)}` : "/files"}>Back to {parent ? parent.split("/").join(" / ") : "all files"}</a>}
      {status && <p className={styles.status}>{status}</p>}
      {!status && library.folders.length === 0 && library.files.length === 0 && <p className={styles.status}>No files have been published here yet.</p>}
      {library.folders.map((folder) => <a className={`${styles.fileRow} ${styles.folderRow}`} href={folder.url} key={folder.path}><span><span className={styles.folderMark}>Folder</span>{folder.name}</span><span className={styles.fileMeta}>Open <span className={styles.arrow} aria-hidden="true" /></span></a>)}
      {library.files.map((file) => <a className={styles.fileRow} href={file.url} key={file.key}><span>{file.name}</span><span className={styles.fileMeta}>{formatSize(file.size)} <span className={styles.arrow} aria-hidden="true" /></span></a>)}
    </section>
  </main>;
}