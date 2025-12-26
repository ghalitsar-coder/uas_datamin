"use client";

import { useState } from "react";
import {
  Database,
  Search,
  FileText,
  Upload,
  FolderOpen,
  AlertCircle,
  Hash,
  Sparkles,
  FileSearch,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/document-retrieval/StatsCard";
import { DocumentCard } from "@/components/document-retrieval/DocumentCard";
import { SearchResultCard } from "@/components/document-retrieval/SearchResultCard";
import { ProcessingProgress } from "@/components/document-retrieval/ProcessingProgress";
import { QueryInfoCard } from "@/components/document-retrieval/QueryInfoCard";
import { EmptyState } from "@/components/document-retrieval/EmptyState";
import { DocumentDetailModal } from "@/components/document-retrieval/DocumentDetailModal";

// Types
interface Document {
  id: string;
  filename: string;
  original_text_preview: string;
  processed_text_preview: string;
  word_count: number;
}

interface DocumentDetail {
  id: number;
  filename: string;
  file_path: string;
  original_text: string;
  processed_text: string;
  tokens: string[];
  word_count: number;
}

interface SearchResult {
  rank: number;
  filename: string;
  similarity: number;
  original_text: string;
  word_count: number;
}

interface SearchResponse {
  query_original: string;
  query_processed: string;
  query_tokens: string[];
  total_results: number;
  results: SearchResult[];
}

interface UploadProgress {
  current: number;
  total: number;
  filename: string;
  message: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "search">("upload");
  const [folderPath, setFolderPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [isIndexed, setIsIndexed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(""); // Track search query for highlighting

  // Modal state
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for demo
  const mockStats = {
    totalDocuments: documents.length,
    totalWords: documents.reduce((acc, doc) => acc + doc.word_count, 0),
    avgWords:
      documents.length > 0
        ? Math.round(
            documents.reduce((acc, doc) => acc + doc.word_count, 0) /
              documents.length
          )
        : 0,
  };

  const handleUpload = async () => {
    if (!folderPath.trim()) {
      setError("Masukkan path folder terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(null);

    try {
      // Simulated streaming upload - replace with actual API call
      const response = await fetch("http://localhost:8000/api/upload-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_path: folderPath }),
      });

      if (!response.ok) throw new Error("Failed to upload");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.status === "processing") {
                setUploadProgress({
                  current: data.current,
                  total: data.total,
                  filename: data.filename,
                  message: data.message,
                });
              } else if (data.status === "complete") {
                setDocuments(data.documents);
                setIsIndexed(true);
                setUploadProgress(null);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Masukkan kata kunci pencarian");
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, top_k: 10 }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setSearchResults(data);
      setCurrentSearchQuery(searchQuery); // Save for highlighting
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDocumentClick = async (docId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/document/${docId}`
      );
      if (!response.ok) throw new Error("Failed to fetch document detail");

      const data = await response.json();
      setSelectedDocument(data.document);
      setIsModalOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat detail dokumen"
      );
    }
  };

  const handleSearchResultClick = async (docId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/document/${docId}`
      );
      if (!response.ok) throw new Error("Failed to fetch document detail");

      const data = await response.json();
      setSelectedDocument(data.document);
      setIsModalOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat detail dokumen"
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative container mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  <span className="gradient-text">Sistem Temu Balik</span>
                  <span className="text-foreground"> Dokumen</span>
                </h1>
              </div>
              <p className="text-muted-foreground max-w-lg">
                TF-IDF + Generalized Jaccard Similarity + Sastrawi Stemming
                untuk pencarian dokumen yang akurat
              </p>
            </div>

            {/* Quick Stats */}
            {isIndexed && (
              <div className="flex items-center gap-4 animate-fade-in">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
                  {documents.length} Dokumen Terindeks
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50 w-fit mb-8">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === "upload"
                ? "bg-card shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Database className="h-4 w-4" />
            Dataset & Indexing
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === "search"
                ? "bg-card shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            Pencarian
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-destructive/70 hover:text-destructive"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-8 animate-fade-in">
            {/* Upload Card */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Load Dataset</h2>
                  <p className="text-sm text-muted-foreground">
                    Masukkan path folder yang berisi file .txt, .pdf, atau .docx
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleUpload()}
                    placeholder="Contoh: C:/Documents/dataset atau ../generator/dataset_sample"
                    className="pl-12 h-12 border-border/50 focus:border-primary focus:ring-primary/20"
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="h-12 px-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Load Dokumen
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            {loading && uploadProgress && (
              <ProcessingProgress progress={uploadProgress} />
            )}

            {/* Stats Cards */}
            {isIndexed && documents.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                <StatsCard
                  title="Total Dokumen"
                  value={mockStats.totalDocuments}
                  icon={FileText}
                  variant="primary"
                />
                <StatsCard
                  title="Total Kata Terindeks"
                  value={mockStats.totalWords.toLocaleString()}
                  icon={Hash}
                  variant="secondary"
                />
                <StatsCard
                  title="Rata-rata Kata/Dokumen"
                  value={mockStats.avgWords}
                  icon={Sparkles}
                  variant="accent"
                />
              </div>
            )}

            {/* Document Cards */}
            {documents.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Daftar Dokumen ({documents.length})
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
                  {documents.map((doc, index) => (
                    <DocumentCard
                      key={doc.id}
                      index={index}
                      filename={doc.filename}
                      originalPreview={doc.original_text_preview}
                      processedPreview={doc.processed_text_preview}
                      wordCount={doc.word_count}
                      onClick={() => handleDocumentClick(doc.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              !loading && (
                <EmptyState
                  icon={FolderOpen}
                  title="Belum Ada Dokumen"
                  description="Masukkan path folder dan klik 'Load Dokumen' untuk memulai indexing dataset Anda."
                />
              )
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="space-y-8 animate-fade-in">
            {/* Search Card */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20">
                  <Search className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Cari Dokumen</h2>
                  <p className="text-sm text-muted-foreground">
                    Masukkan kata kunci untuk mencari dokumen yang relevan
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Masukkan kata kunci pencarian..."
                    className="pl-12 h-12 border-border/50 focus:border-secondary focus:ring-secondary/20"
                    disabled={!isIndexed || searchLoading}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!isIndexed || searchLoading}
                  className="h-12 px-6 bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-secondary/25"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Cari
                    </>
                  )}
                </Button>
              </div>

              {!isIndexed && (
                <div className="flex items-center gap-2 mt-4 text-sm text-warning">
                  <AlertCircle className="h-4 w-4" />
                  Upload dokumen terlebih dahulu di tab &quot;Dataset &
                  Indexing&quot;
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults ? (
              <div className="space-y-6">
                {/* Query Info */}
                <QueryInfoCard
                  queryOriginal={searchResults.query_original}
                  queryProcessed={searchResults.query_processed}
                  tokens={searchResults.query_tokens}
                  totalResults={searchResults.total_results}
                />

                {/* Results Grid */}
                {searchResults.results.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
                    {searchResults.results.map((result, idx) => (
                      <SearchResultCard
                        key={`${result.rank}-${result.filename}`}
                        rank={result.rank}
                        docId={idx}
                        filename={result.filename}
                        similarity={result.similarity}
                        preview={result.original_text}
                        wordCount={result.word_count}
                        maxScore={searchResults.results[0]?.similarity || 1}
                        onClick={() => handleSearchResultClick(idx)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileSearch}
                    title="Tidak Ada Hasil"
                    description="Tidak ditemukan dokumen yang cocok dengan kata kunci Anda. Coba gunakan kata kunci yang berbeda."
                  />
                )}
              </div>
            ) : (
              <EmptyState
                icon={FileSearch}
                title="Mulai Pencarian"
                description="Masukkan kata kunci di atas untuk mencari dokumen yang relevan berdasarkan kemiripan konten."
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Sistem Temu Balik Dokumen v2.0</p>
            <p>TF-IDF + Generalized Jaccard Similarity + Sastrawi</p>
          </div>
        </div>
      </footer>

      {/* Document Detail Modal */}
      <DocumentDetailModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        searchQuery={currentSearchQuery}
      />
    </div>
  );
}
