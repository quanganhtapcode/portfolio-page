"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "../files.module.css";

type FileEntry = { key: string; name: string; size: number; updatedAt: string | null; url: string };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesAdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    const response = await fetch("/api/files/list");
    const data = await response.json();
    if (response.ok) setFiles(data.files);
  };

  useEffect(() => {
    fetch("/api/files/status")
      .then((response) => response.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
        if (data.authenticated) void loadFiles();
      })
      .catch(() => setAuthenticated(false));
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/files/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(data.error || "Could not sign in.");
    setPassword("");
    setAuthenticated(true);
    await loadFiles();
  }

  async function upload(file: File) {
    setBusy(true);
    setMessage(`Preparing ${file.name}…`);
    try {
      const signature = await fetch("/api/files/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type }) });
      const data = await signature.json();
      if (!signature.ok) throw new Error(data.error);
      setMessage(`Uploading ${file.name}…`);
      const uploaded = await fetch(data.uploadUrl, { method: "PUT", headers: data.headers, body: file });
      if (!uploaded.ok) throw new Error("R2 rejected the upload. Check the bucket CORS rule.");
      setMessage(`Uploaded. Public link: ${window.location.origin}${data.publicUrl}`);
      await loadFiles();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(key: string, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setBusy(true);
    const response = await fetch("/api/files/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
    setBusy(false);
    if (!response.ok) return setMessage("Could not delete the file.");
    setMessage("File deleted.");
    await loadFiles();
  }

  async function signOut() {
    await fetch("/api/files/logout", { method: "POST" });
    setAuthenticated(false);
    setFiles([]);
  }

  if (authenticated === null) return <main className={styles.page}><p className={styles.status}>Checking access…</p></main>;

  if (!authenticated) {
    return <main className={styles.page}>
      <header className={styles.header}><a className={styles.brand} href="/">LA<sup>®</sup></a><a className={styles.adminLink} href="/files">View library <span className={styles.arrow} aria-hidden="true" /></a></header>
      <section className={styles.login}><p className={styles.eyebrow}>Private area</p><h1>File admin.</h1><p>Sign in to upload, copy links, or delete files.</p><form onSubmit={signIn}><label htmlFor="password">Admin password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required /><button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form>{message && <p className={styles.message}>{message}</p>}</section>
    </main>;
  }

  return <main className={styles.page}>
    <header className={styles.header}><a className={styles.brand} href="/">LA<sup>®</sup></a><div className={styles.headerActions}><a className={styles.adminLink} href="/files">View library <span className={styles.arrow} aria-hidden="true" /></a><button className={styles.textButton} onClick={signOut}>Sign out</button></div></header>
    <section className={styles.adminIntro}><p className={styles.eyebrow}>Private area</p><h1>File admin.</h1><p>Files upload directly from your browser to Cloudflare R2. Nothing is committed to GitHub.</p><label className={styles.uploadButton} htmlFor="file-upload">{busy ? "Working…" : "Upload a file"}<input ref={inputRef} id="file-upload" type="file" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /></label>{message && <p className={styles.message}>{message}</p>}</section>
    <section className={styles.list}>{files.length === 0 ? <p className={styles.status}>No uploaded files yet.</p> : files.map((file) => <article className={styles.fileRow} key={file.key}><a href={file.url}>{file.name}</a><div className={styles.fileControls}><span className={styles.fileMeta}>{formatSize(file.size)}</span><button className={styles.copyButton} onClick={() => { void navigator.clipboard.writeText(`${window.location.origin}${file.url}`); setMessage(`Copied link for ${file.name}.`); }}>Copy link</button><button className={styles.deleteButton} disabled={busy} onClick={() => void remove(file.key, file.name)}>Delete</button></div></article>)}</section>
  </main>;
}