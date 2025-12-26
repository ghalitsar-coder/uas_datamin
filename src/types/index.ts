// Types untuk aplikasi

export interface Document {
  id: number;
  filename: string;
  original_text_preview: string;
  processed_text_preview: string;
  word_count: number;
}

export interface DocumentDetail extends Document {
  file_path: string;
  original_text: string;
  processed_text: string;
  tokens: string[];
  preprocessing_steps: PreprocessingSteps;
}

export interface PreprocessingSteps {
  original: string;
  case_folding: string;
  tokenizing: string;
  filtering: string;
  stopword_removal: string;
  stemming: string;
}

export interface SearchResult {
  rank: number;
  doc_index: number;
  similarity: number;
  filename: string;
  original_text: string;
  processed_text: string;
  word_count: number;
}

export interface SearchResponse {
  status: string;
  query_original: string;
  query_processed: string;
  query_tokens: string[];
  total_results: number;
  showing: number;
  results: SearchResult[];
}

export interface UploadResponse {
  status: string;
  message: string;
  total_documents: number;
  documents: Document[];
}

export interface TFIDFMatrix {
  num_documents: number;
  num_terms: number;
  documents: Array<{
    doc_index: number;
    top_terms: Array<{
      term: string;
      tfidf: number;
    }>;
  }>;
  terms: string[];
  matrix: number[][];
}

export interface HealthCheck {
  message: string;
  version: string;
  status: string;
  indexed: boolean;
  total_documents: number;
}
