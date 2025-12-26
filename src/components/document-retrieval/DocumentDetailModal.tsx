"use client";

import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Copy,
  Download,
  Search,
  BarChart3,
  FileCode,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Hash,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";

interface DocumentDetail {
  id: number;
  filename: string;
  file_path: string;
  original_text: string;
  processed_text: string;
  tokens: string[];
  word_count: number;
}

interface DocumentDetailModalProps {
  document: DocumentDetail | null;
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string; // Query dari hasil pencarian untuk highlighting
}

export function DocumentDetailModal({
  document,
  isOpen,
  onClose,
  searchQuery = "",
}: DocumentDetailModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [aiFormatted, setAiFormatted] = useState(false);
  const [formattedContent, setFormattedContent] = useState("");
  const [isFormattingAI, setIsFormattingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Reset AI formatting state ketika dokumen berubah atau modal ditutup
  useEffect(() => {
    if (!isOpen || !document) {
      // Reset semua state AI formatting ketika modal ditutup
      setAiFormatted(false);
      setFormattedContent("");
      setAiError(null);
      setSearchTerm("");
      setActiveTab("preview");
    } else if (searchQuery) {
      // Set searchTerm dari searchQuery jika modal dibuka dari hasil pencarian
      setSearchTerm(searchQuery);
    }
  }, [document?.id, isOpen, searchQuery]);

  // Format text dengan paragraphs (split by double newline)
  const formattedOriginalText = useMemo(() => {
    if (!document) return [];
    return document.original_text
      .split(/\n{2,}/) // Split by 2 or more newlines
      .filter((para) => para.trim().length > 0);
  }, [document]);

  // Statistics calculations
  const statistics = useMemo(() => {
    if (!document) {
      return {
        originalWordCount: 0,
        uniqueOriginalWords: 0,
        processedWordCount: 0,
        uniqueProcessedWords: 0,
        tokenCount: 0,
        uniqueTokens: 0,
        topTokens: [] as [string, number][],
        reductionPercentage: "0",
        avgWordLength: "0",
        paragraphCount: 0,
        charCount: 0,
        charCountNoSpaces: 0,
        tokenFrequency: {},
      };
    }

    const originalWords = document.original_text.split(/\s+/).filter(Boolean);
    const uniqueOriginalWords = new Set(
      originalWords.map((w) => w.toLowerCase())
    );

    const processedWords = document.processed_text.split(/\s+/).filter(Boolean);
    const uniqueProcessedWords = new Set(processedWords);

    // Token frequency
    const tokenFrequency: { [key: string]: number } = {};
    document.tokens.forEach((token) => {
      tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
    });

    const topTokens = Object.entries(tokenFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Reduction stats
    const reductionPercentage = (
      ((originalWords.length - document.tokens.length) / originalWords.length) *
      100
    ).toFixed(1);

    // Average word length
    const avgWordLength = (
      document.tokens.reduce((sum, token) => sum + token.length, 0) /
      document.tokens.length
    ).toFixed(1);

    // Paragraphs count
    const paragraphCount = document.original_text
      .split(/\n{2,}/)
      .filter((p) => p.trim().length > 0).length;

    // Character count
    const charCount = document.original_text.length;
    const charCountNoSpaces = document.original_text.replace(/\s/g, "").length;

    return {
      originalWordCount: originalWords.length,
      uniqueOriginalWords: uniqueOriginalWords.size,
      processedWordCount: processedWords.length,
      uniqueProcessedWords: uniqueProcessedWords.size,
      tokenCount: document.tokens.length,
      uniqueTokens: new Set(document.tokens).size,
      topTokens,
      reductionPercentage,
      avgWordLength,
      paragraphCount,
      charCount,
      charCountNoSpaces,
      tokenFrequency,
    };
  }, [document]);

  if (!document) return null;

  // Highlight search term dalam text
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-700 px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Helper untuk highlight text dalam React element (untuk markdown)
  const highlightInChildren = (children: any): any => {
    if (!searchTerm.trim()) return children;

    if (typeof children === "string") {
      const parts = children.split(new RegExp(`(${searchTerm})`, "gi"));
      return parts.map((part, i) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-300 dark:bg-yellow-700 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    }

    if (Array.isArray(children)) {
      return children.map((child, i) =>
        typeof child === "string" ? highlightInChildren(child) : child
      );
    }

    return children;
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download as text file
  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format dengan AI
  const handleAIFormat = async () => {
    if (!document || isFormattingAI) return;

    setIsFormattingAI(true);
    setAiError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/document/${document.id}/format-ai`
      );

      if (!response.ok) {
        throw new Error("Failed to format with AI");
      }

      const data = await response.json();

      if (data.error) {
        setAiError(data.error);
        setAiFormatted(false);
      } else {
        setFormattedContent(data.formatted_text);
        setAiFormatted(true);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Gagal format dengan AI");
      setAiFormatted(false);
    } finally {
      setIsFormattingAI(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full lg:max-w-7xl max-h-[95vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                {document.filename}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-muted-foreground">
                {document.file_path}
              </DialogDescription>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  <Hash className="w-3 h-3 mr-1" />
                  {statistics.originalWordCount.toLocaleString()} kata
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <FileCode className="w-3 h-3 mr-1" />
                  {statistics.charCount.toLocaleString()} karakter
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  {statistics.paragraphCount} paragraf
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-6 pt-4 border-b border-border">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Original
              </TabsTrigger>
              <TabsTrigger
                value="processed"
                className="flex items-center gap-2"
              >
                <FileCode className="w-4 h-4" />
                Processed
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Statistik
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Original Preview */}
          <TabsContent
            value="preview"
            className="flex-1 min-h-0 px-6 pb-6 mt-0"
          >
            <div className="h-full flex flex-col gap-4 pt-4">
              {/* Search bar & AI Format button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari dalam dokumen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* AI Format Toggle Button */}
                <Button
                  variant={aiFormatted ? "default" : "outline"}
                  size="sm"
                  onClick={handleAIFormat}
                  disabled={isFormattingAI}
                  className="shrink-0"
                >
                  {isFormattingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Formatting...
                    </>
                  ) : aiFormatted ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Formatted ✨
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Format AI
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(document.original_text)}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(document.original_text, document.filename)
                  }
                  className="shrink-0"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* AI Error Alert */}
              {aiError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{aiError}</p>
                  <button
                    onClick={() => setAiError(null)}
                    className="ml-auto hover:opacity-70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Content - AI Formatted atau Simple */}
              <ScrollArea className="flex-1 rounded-lg border border-border bg-muted/30">
                <div className="p-6 max-h-[60vh]">
                  {aiFormatted ? (
                    // AI Formatted Markdown dengan Custom Components + Highlighting
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Headings with highlighting
                          h1: ({ node, children, ...props }) => (
                            <h1
                              className="text-3xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </h1>
                          ),
                          h2: ({ node, children, ...props }) => (
                            <h2
                              className="text-2xl font-bold mt-6 mb-3 text-foreground"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </h2>
                          ),
                          h3: ({ node, children, ...props }) => (
                            <h3
                              className="text-xl font-semibold mt-4 mb-2 text-foreground"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </h3>
                          ),
                          h4: ({ node, children, ...props }) => (
                            <h4
                              className="text-lg font-semibold mt-3 mb-2 text-foreground"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </h4>
                          ),
                          // Paragraphs with highlighting
                          p: ({ node, children, ...props }) => (
                            <p
                              className="mb-4 text-foreground leading-relaxed"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </p>
                          ),
                          // Strong/Bold with highlighting
                          strong: ({ node, children, ...props }) => (
                            <strong
                              className="font-bold text-primary"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </strong>
                          ),
                          // Emphasis/Italic with highlighting
                          em: ({ node, children, ...props }) => (
                            <em
                              className="italic text-foreground/90"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </em>
                          ),
                          // Unordered List
                          ul: ({ node, ...props }) => (
                            <ul
                              className="mb-4 ml-6 list-disc space-y-2 text-foreground"
                              {...props}
                            />
                          ),
                          // Ordered List
                          ol: ({ node, ...props }) => (
                            <ol
                              className="mb-4 ml-6 list-decimal space-y-2 text-foreground"
                              {...props}
                            />
                          ),
                          // List Items with highlighting
                          li: ({ node, children, ...props }) => (
                            <li
                              className="text-foreground leading-relaxed"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </li>
                          ),
                          // Horizontal Rule
                          hr: ({ node, ...props }) => (
                            <hr className="my-8 border-border" {...props} />
                          ),
                          // Blockquote with highlighting
                          blockquote: ({ node, children, ...props }) => (
                            <blockquote
                              className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground bg-muted/50 rounded-r"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </blockquote>
                          ),
                          // Code Block
                          code: ({ node, inline, ...props }: any) =>
                            inline ? (
                              <code
                                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
                                {...props}
                              />
                            ) : (
                              <code
                                className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto"
                                {...props}
                              />
                            ),
                          // Links with highlighting
                          a: ({ node, children, ...props }) => (
                            <a
                              className="text-primary hover:underline font-medium"
                              {...props}
                            >
                              {highlightInChildren(children)}
                            </a>
                          ),
                        }}
                      >
                        {formattedContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    // Simple Formatted Text
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {formattedOriginalText.map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="mb-4 text-foreground leading-relaxed whitespace-pre-wrap"
                        >
                          {highlightText(paragraph, searchTerm)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Tab: Processed Text */}
          <TabsContent
            value="processed"
            className="flex-1 min-h-0 px-6 pb-6 mt-0"
          >
            <div className="h-full flex flex-col gap-4 pt-4">
              {/* Info banner */}
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Teks ini telah melalui preprocessing:{" "}
                  <strong>case folding</strong>, <strong>tokenizing</strong>,{" "}
                  <strong>filtering</strong>, <strong>stopword removal</strong>,
                  dan <strong>stemming</strong>.
                </p>
              </div>

              {/* Reduction stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-900 dark:text-green-100">
                      Reduksi Kata
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {statistics.reductionPercentage}%
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {statistics.originalWordCount} → {statistics.tokenCount}{" "}
                    kata
                  </p>
                </div>

                <div className="px-4 py-3 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                      Unique Tokens
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {statistics.uniqueTokens}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    dari {statistics.tokenCount} total
                  </p>
                </div>

                <div className="px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-900 dark:text-amber-100">
                      Avg Word Length
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {statistics.avgWordLength}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    karakter per kata
                  </p>
                </div>
              </div>

              {/* Tokens display */}
              <ScrollArea className="flex-1 rounded-lg border border-border bg-muted/30">
                <div className="p-6 max-h-[60vh]">
                  <div className="flex flex-wrap gap-2">
                    {document.tokens.map((token, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="px-2 py-1 text-xs font-mono"
                      >
                        {token}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Tab: Statistics */}
          <TabsContent
            value="statistics"
            className="flex-1 min-h-0 px-6 pb-6 mt-0"
          >
            <ScrollArea className="h-full">
              <div className="pt-4 max-h-[70vh] space-y-6">
                {/* Overview Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Overview Statistik
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      label="Total Kata (Original)"
                      value={statistics.originalWordCount.toLocaleString()}
                      icon="📝"
                    />
                    <StatCard
                      label="Unique Words (Original)"
                      value={statistics.uniqueOriginalWords.toLocaleString()}
                      icon="🔤"
                    />
                    <StatCard
                      label="Total Tokens"
                      value={statistics.tokenCount.toLocaleString()}
                      icon="🎯"
                    />
                    <StatCard
                      label="Unique Tokens"
                      value={statistics.uniqueTokens.toLocaleString()}
                      icon="✨"
                    />
                    <StatCard
                      label="Total Karakter"
                      value={statistics.charCount.toLocaleString()}
                      icon="🔢"
                    />
                    <StatCard
                      label="Karakter (tanpa spasi)"
                      value={statistics.charCountNoSpaces.toLocaleString()}
                      icon="📊"
                    />
                    <StatCard
                      label="Paragraf"
                      value={statistics.paragraphCount.toString()}
                      icon="📄"
                    />
                    <StatCard
                      label="Reduksi"
                      value={`${statistics.reductionPercentage}%`}
                      icon="📉"
                    />
                  </div>
                </div>

                {/* Top 10 Most Frequent Tokens */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Top 10 Token Paling Sering Muncul
                  </h3>
                  <div className="space-y-2">
                    {statistics.topTokens.map(([token, count], idx) => {
                      const percentage = (
                        (count / statistics.tokenCount) *
                        100
                      ).toFixed(1);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-semibold text-foreground">
                                {token}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {count}x ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                                style={{
                                  width: `${Math.min(
                                    (count / statistics.topTokens[0][1]) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Processing Impact */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-primary" />
                    Dampak Preprocessing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Sebelum Preprocessing
                      </h4>
                      <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                        <p>• Total kata: {statistics.originalWordCount}</p>
                        <p>• Unique words: {statistics.uniqueOriginalWords}</p>
                        <p>
                          • Diversity:{" "}
                          {(
                            (statistics.uniqueOriginalWords /
                              statistics.originalWordCount) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                        Setelah Preprocessing
                      </h4>
                      <div className="space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                        <p>• Total tokens: {statistics.tokenCount}</p>
                        <p>• Unique tokens: {statistics.uniqueTokens}</p>
                        <p>
                          • Diversity:{" "}
                          {(
                            (statistics.uniqueTokens / statistics.tokenCount) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper component untuk stat card
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 border border-border rounded-lg hover:shadow-md transition-shadow">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
