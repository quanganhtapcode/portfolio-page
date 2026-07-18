"use client";

import { useEffect, useState } from "react";
import styles from "./files.module.css";

type FileEntry = { key: string; name: string; size: number; updatedAt: string | null; url: string };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [status, setStatus] = useState("Loading files…");

  useEffect(() => {
    fetch("/api/files/list")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setFiles(data.files);
        setStatus("");
      })
      .catch((error: Error) => setStatus(error.message || "The file library is unavailable."));
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Le Quang Anh home">LA<sup>®</sup></a>
        <a className={styles.adminLink} href="/files/admin">Manage files <span className={styles.arrow} aria-hidden="true" /></a>
      </header>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Le Quang Anh / File library</p>
        <h1>Selected files,<br /><em>ready to share.</em></h1>
        <p>Research papers, professional documents and supporting material.</p>
      </section>
      <section className={styles.list} aria-live="polite">
        {status && <p className={styles.status}>{status}</p>}
        {!status && files.length === 0 && <p className={styles.status}>No files have been published yet.</p>}
        {files.map((file) => (
          <a className={styles.fileRow} href={file.url} key={file.key}>
            <span>{file.name}</span>
            <span className={styles.fileMeta}>{formatSize(file.size)} <span className={styles.arrow} aria-hidden="true" /></span>
          </a>
        ))}
      </section>
    </main>
  );
}