# Frontend Design Document (FDD)
## Sistem Temu Balik Dokumen - Next.js Frontend

**Platform:** Web Application (Next.js 14+ with TypeScript)  
**Styling:** Tailwind CSS  
**Versi:** 2.0  
**Tanggal:** 26 Desember 2025

---

## 1. Arsitektur Frontend

### 1.1. Tech Stack
- **Framework:** Next.js 14+ dengan App Router
- **Language:** TypeScript untuk type safety
- **Styling:** Tailwind CSS untuk utility-first styling
- **State Management:** React Hooks (useState)
- **API Communication:** Fetch API dengan streaming support
- **Real-time Updates:** Server-Sent Events (SSE)

### 1.2. Struktur Folder
```
src/
├── app/
│   ├── layout.tsx          # Root layout dengan metadata
│   ├── page.tsx            # Main page (Upload + Search tabs)
│   └── globals.css         # Global CSS dengan Tailwind directives
├── components/
│   ├── DocumentTable.tsx        # Tabel daftar dokumen
│   ├── SearchResultsTable.tsx   # Tabel hasil pencarian
│   └── LoadingSpinner.tsx       # Loading indicator
├── lib/
│   └── api.ts              # API client utility
└── types/
    └── index.ts            # TypeScript type definitions
```

---

## 2. Halaman Utama (Main Page)

### 2.1. Header Section
**Komponen:** Fixed header dengan background gradient biru

**Elemen:**
- **Judul:** "📄 Sistem Temu Balik Dokumen"
- **Subtitle:** "TF-IDF + Generalized Jaccard Similarity + Sastrawi Stemming"
- **Warna:** Background `bg-blue-600`, text putih
- **Shadow:** `shadow-lg` untuk depth

**Kode:**
```tsx
<header className="bg-blue-600 text-white shadow-lg">
  <div className="container mx-auto px-6 py-6">
    <h1 className="text-3xl font-bold">📄 Sistem Temu Balik Dokumen</h1>
    <p className="mt-2 text-blue-100">
      TF-IDF + Generalized Jaccard Similarity + Sastrawi Stemming
    </p>
  </div>
</header>
```

### 2.2. Tab Navigation
**Komponen:** Tab switcher untuk navigasi antara 2 halaman utama

**Tabs:**
1. **📂 Dataset & Indexing** - Upload dan preprocessing dokumen
2. **🔍 Pencarian** - Search dan ranking dokumen

**Behavior:**
- Active tab: Border bawah biru (`border-b-2 border-blue-600`), text biru
- Inactive tab: Text abu-abu, hover effect
- State management: `activeTab` state dengan nilai `'upload' | 'search'`

**Kode:**
```tsx
<div className="flex space-x-4 border-b border-gray-200 mb-6">
  <button
    onClick={() => setActiveTab('upload')}
    className={activeTab === 'upload' 
      ? 'border-b-2 border-blue-600 text-blue-600' 
      : 'text-gray-600 hover:text-gray-900'}
  >
    📂 Dataset & Indexing
  </button>
  <button
    onClick={() => setActiveTab('search')}
    className={activeTab === 'search' 
      ? 'border-b-2 border-blue-600 text-blue-600' 
      : 'text-gray-600 hover:text-gray-900'}
  >
    🔍 Pencarian
  </button>
</div>
```

### 2.3. Error Alert
**Komponen:** Alert box untuk menampilkan error messages

**Style:**
- Background: `bg-red-100`
- Border: `border border-red-400`
- Text: `text-red-700`
- Padding: `px-4 py-3`
- Rounded corners: `rounded`

**Display Logic:**
```tsx
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    <strong>Error: </strong>
    {error}
  </div>
)}
```

---

## 3. Tab 1: Dataset & Indexing

### 3.1. Upload Section
**Card:** White card dengan shadow dan rounded corners

**Input Components:**
1. **Text Input** - Path folder dokumen
   - Placeholder: "Contoh: C:/Documents/dataset atau ../generator/dataset_sample"
   - Style: `flex-1 px-4 py-2 border border-gray-300 rounded-lg`
   - Focus: `focus:ring-2 focus:ring-blue-500`

2. **Button** - Load Dokumen
   - Style: `px-6 py-2 bg-blue-600 text-white rounded-lg`
   - Hover: `hover:bg-blue-700`
   - Disabled state: `disabled:bg-gray-400`
   - Icon: 📥

3. **Help Text**
   - Text: "Masukkan path folder yang berisi file .txt, .pdf, atau .docx"
   - Style: `mt-2 text-sm text-gray-600`

**Layout:**
```tsx
<div className="flex gap-4">
  <input
    type="text"
    value={folderPath}
    onChange={(e) => setFolderPath(e.target.value)}
    placeholder="Contoh: C:/Documents/dataset"
    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
  />
  <button
    onClick={handleUpload}
    disabled={loading}
    className="px-6 py-2 bg-blue-600 text-white rounded-lg"
  >
    {loading ? 'Loading...' : '📥 Load Dokumen'}
  </button>
</div>
```

### 3.2. Progress Indicator (Real-time)
**Komponen:** Progress bar dengan informasi detail

**Ditampilkan saat:** `loading === true && uploadProgress !== null`

**Elemen:**
1. **Header:** "🔄 Preprocessing Dokumen..."
2. **Progress Bar:**
   - Container: `w-full bg-gray-200 rounded-full h-4`
   - Fill: `bg-blue-600 h-4 rounded-full`
   - Width: Dynamic berdasarkan persentase
   - Persentase: Ditampilkan di dalam bar (white text)

3. **Status Text:**
   - Current/Total: "X/Y" di kanan atas
   - Message: Status saat ini (kiri atas)
   - Filename: "📄 File saat ini: xxx.pdf"

**Progress Data:**
```typescript
{
  current: number;      // File ke-X
  total: number;        // dari N total file
  filename: string;     // Nama file sedang diproses
  message: string;      // "Memproses: xxx (X/Y)"
}
```

**Visual Example:**
```
🔄 Preprocessing Dokumen...

Memproses: doc_5_Teknologi.pdf (5/10)               5/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    50%

📄 File saat ini: doc_5_Teknologi.pdf
```

**Implementation:**
```tsx
{loading && uploadProgress && (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-xl font-bold mb-4">🔄 Preprocessing Dokumen...</h3>
    
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{uploadProgress.message}</span>
          <span className="text-gray-600">
            {uploadProgress.current}/{uploadProgress.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
          >
            <span className="text-xs text-white font-semibold">
              {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>📄 File saat ini: <span className="font-medium">{uploadProgress.filename}</span></p>
      </div>
    </div>
  </div>
)}
```

### 3.3. Document Table
**Komponen:** Tabel responsive untuk menampilkan daftar dokumen

**Kolom:**
| No | Nama File | Teks Asli (Cuplikan) | Hasil Stemming | Jumlah Kata Dasar |
|----|-----------|----------------------|----------------|-------------------|
| 1  | doc1.txt  | Saya sedang...       | saya...        | 15                |

**Style Features:**
- Header: `bg-gray-50` dengan text uppercase
- Rows: Hover effect `hover:bg-gray-50`
- Border: `border border-gray-200`
- Text truncate: `max-w-md truncate` untuk cuplikan panjang
- Responsive: `overflow-x-auto` untuk mobile

**Data Display:**
```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th>No</th>
      <th>Nama File</th>
      <th>Teks Asli (Cuplikan)</th>
      <th>Hasil Stemming</th>
      <th>Jumlah Kata Dasar</th>
    </tr>
  </thead>
  <tbody>
    {documents.map((doc, index) => (
      <tr key={doc.id} className="hover:bg-gray-50">
        <td>{index + 1}</td>
        <td className="font-medium">{doc.filename}</td>
        <td className="max-w-md truncate">{doc.original_text_preview}</td>
        <td className="max-w-md truncate">{doc.processed_text_preview}</td>
        <td className="text-center">{doc.word_count}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Header:**
- Title: "📋 Daftar Dokumen (X)" dengan total count

---

## 4. Tab 2: Pencarian

### 4.1. Search Box Section
**Card:** White card dengan form pencarian

**Input Components:**
1. **Search Input**
   - Placeholder: "Masukkan kata kunci pencarian..."
   - Disabled: Jika belum ada dokumen terindex
   - Enter key: Trigger search

2. **Search Button**
   - Text: "Cari" atau "Searching..." saat loading
   - Disabled: Jika loading atau belum ada index
   - Icon: 🔍 (implicit)

3. **Warning Message** (conditional)
   - Ditampilkan jika: `!isIndexed`
   - Text: "⚠️ Upload dokumen terlebih dahulu di tab "Dataset & Indexing""
   - Style: `text-sm text-red-600`

**Layout:**
```tsx
<div className="flex gap-4">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
    placeholder="Masukkan kata kunci pencarian..."
    disabled={!isIndexed}
  />
  <button
    onClick={handleSearch}
    disabled={loading || !isIndexed}
  >
    {loading ? 'Searching...' : 'Cari'}
  </button>
</div>

{!isIndexed && (
  <p className="mt-2 text-sm text-red-600">
    ⚠️ Upload dokumen terlebih dahulu di tab "Dataset & Indexing"
  </p>
)}
```

### 4.2. Search Results Info
**Section:** Information box sebelum tabel hasil

**Informasi yang Ditampilkan:**
1. **Query Original:** Input asli dari user
2. **Query Stemmed:** Hasil setelah preprocessing
3. **Tokens:** Array kata-kata hasil tokenisasi
4. **Total Hasil:** Jumlah total dokumen yang ditemukan

**Style:**
- Background: White card
- Text: Small (`text-sm`) dengan `text-gray-600`
- Bold labels: `<strong>` tag

**Example Output:**
```
Hasil Pencarian
----------------
Query Original: teknologi informasi
Query Stemmed: teknologi informasi
Tokens: teknologi, informasi
Total Hasil: 10 dokumen
```

**Implementation:**
```tsx
<div className="mb-4">
  <h3 className="text-xl font-bold">Hasil Pencarian</h3>
  <div className="mt-2 text-sm text-gray-600 space-y-1">
    <p><strong>Query Original:</strong> {searchResults.query_original}</p>
    <p><strong>Query Stemmed:</strong> {searchResults.query_processed}</p>
    <p><strong>Tokens:</strong> {searchResults.query_tokens.join(', ')}</p>
    <p><strong>Total Hasil:</strong> {searchResults.total_results} dokumen</p>
  </div>
</div>
```

### 4.3. Search Results Table
**Komponen:** Tabel hasil pencarian dengan ranking

**Kolom:**
| Rank | Nama File | Skor Jaccard | Cuplikan Teks | Jumlah Kata |
|------|-----------|--------------|---------------|-------------|
| 1    | doc3.pdf  | 0.8542       | ...           | 245         |

**Special Features:**

1. **Rank Badge:**
   - Circle badge dengan nomor ranking
   - Style: `w-8 h-8 bg-blue-600 text-white rounded-full`
   - Center aligned: `flex items-center justify-center`

2. **Similarity Score:**
   - Numeric display: 4 decimal places (e.g., "0.8542")
   - Progress bar: Visual representation
   - Bar width: Proportional ke score (score × 100%)
   - Color: `bg-blue-600`

3. **Row Highlighting:**
   - Score > 0.5: `bg-green-50` (highly relevant)
   - Score > 0.3: `bg-yellow-50` (moderately relevant)
   - Score ≤ 0.3: Default white (low relevance)

4. **Empty State:**
   - Message: "Tidak ada hasil ditemukan"
   - Style: Centered, gray text
   - Padding: `py-12`

**Visual Example:**
```
┌──────┬────────────┬──────────────────┬─────────────┐
│  1   │ doc3.pdf   │ 0.8542           │ ...         │
│      │            │ ████████████░░   │             │
│      │            │ 85%              │             │
└──────┴────────────┴──────────────────┴─────────────┘
```

**Implementation:**
```tsx
<tr className={`hover:bg-gray-50 ${
  result.similarity > 0.5 ? 'bg-green-50' : 
  result.similarity > 0.3 ? 'bg-yellow-50' : ''
}`}>
  <td>
    <span className="inline-flex items-center justify-center w-8 h-8 
                     text-sm font-semibold text-white bg-blue-600 rounded-full">
      {result.rank}
    </span>
  </td>
  <td className="font-medium">{result.filename}</td>
  <td>
    <div className="flex items-center">
      <span className="text-sm font-semibold">
        {result.similarity.toFixed(4)}
      </span>
      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${result.similarity * 100}%` }}
        />
      </div>
    </div>
  </td>
  <td className="max-w-md truncate">{result.original_text}</td>
  <td className="text-center">{result.word_count}</td>
</tr>
```

---

## 5. Komponen Reusable

### 5.1. LoadingSpinner
**File:** `components/LoadingSpinner.tsx`

**Props:**
```typescript
interface LoadingSpinnerProps {
  text?: string;  // Default: "Memuat..."
}
```

**Visual:**
- Spinning circle animation
- Blue color (`border-blue-600`)
- Size: 12×12 (`h-12 w-12`)
- Text below spinner

**Usage:**
```tsx
<LoadingSpinner text="Mencari dokumen..." />
```

### 5.2. DocumentTable
**File:** `components/DocumentTable.tsx`

**Props:**
```typescript
interface DocumentTableProps {
  documents: Document[];
  onViewDetail?: (doc: Document) => void;  // Optional callback
}
```

**Features:**
- Responsive table layout
- Hover effects
- Optional detail button per row

### 5.3. SearchResultsTable
**File:** `components/SearchResultsTable.tsx`

**Props:**
```typescript
interface SearchResultsTableProps {
  results: SearchResult[];
}
```

**Features:**
- Ranking display
- Progress bars for similarity scores
- Conditional row highlighting
- Empty state handling

---

## 6. State Management

### 6.1. State Variables
```typescript
const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
const [folderPath, setFolderPath] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [documents, setDocuments] = useState<Document[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
const [isIndexed, setIsIndexed] = useState(false);
const [uploadProgress, setUploadProgress] = useState<{
  current: number;
  total: number;
  filename: string;
  message: string;
} | null>(null);
```

### 6.2. State Flow

**Upload Flow:**
```
User Input Path
     ↓
Click "Load Dokumen"
     ↓
loading = true
uploadProgress = null
     ↓
Stream Events from Backend
     ↓
Update uploadProgress (real-time)
     ↓
Complete
     ↓
documents = [...]
isIndexed = true
loading = false
uploadProgress = null
```

**Search Flow:**
```
User Input Query
     ↓
Click "Cari"
     ↓
loading = true
error = null
     ↓
API Call
     ↓
searchResults = {...}
loading = false
```

---

## 7. API Integration

### 7.1. API Client
**File:** `lib/api.ts`

**Base URL:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

**Methods:**
- `api.uploadDocuments(folderPath)` - Standard upload (deprecated)
- `fetch('/api/upload-stream')` - Streaming upload (current)
- `api.searchDocuments(query, topK)` - Search
- `api.getAllDocuments()` - Get all documents
- `api.getDocumentDetail(id)` - Get single document
- `api.getTFIDFMatrix()` - Get TF-IDF matrix

### 7.2. Streaming Upload
**Endpoint:** `POST /api/upload-stream`

**Technology:** Server-Sent Events (SSE)

**Event Format:**
```
data: {"status": "processing", "current": 5, "total": 10, "filename": "doc5.pdf", "message": "Memproses: doc5.pdf (5/10)"}
data: {"status": "complete", "documents": [...]}
```

**Client Implementation:**
```typescript
const response = await fetch('http://localhost:8000/api/upload-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ folder_path: folderPath }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Update state based on data.status
    }
  }
}
```

---

## 8. Responsive Design

### 8.1. Breakpoints (Tailwind)
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md, lg)
- **Desktop:** > 1024px (xl, 2xl)

### 8.2. Mobile Adaptations
1. **Container:** `container mx-auto px-6` - Responsive padding
2. **Tables:** `overflow-x-auto` - Horizontal scroll on small screens
3. **Flex layouts:** Stack vertically on mobile via `flex-col sm:flex-row`
4. **Text sizes:** `text-3xl` on desktop, smaller on mobile

### 8.3. Container Width
```tsx
<main className="container mx-auto px-6 py-8">
  {/* Max width auto-calculated by Tailwind */}
</main>
```

---

## 9. Color Palette

### 9.1. Primary Colors
- **Blue 600:** `#2563eb` - Primary actions, header
- **Blue 700:** `#1d4ed8` - Hover states
- **Blue 100:** `#dbeafe` - Light accents

### 9.2. Semantic Colors
- **Green 50:** `#f0fdf4` - High relevance (score > 0.5)
- **Yellow 50:** `#fefce8` - Medium relevance (score > 0.3)
- **Red 600:** `#dc2626` - Errors, warnings
- **Red 100:** `#fee2e2` - Error backgrounds

### 9.3. Neutral Colors
- **Gray 50:** `#f9fafb` - Table headers, backgrounds
- **Gray 200:** `#e5e7eb` - Borders, dividers
- **Gray 600:** `#4b5563` - Secondary text
- **Gray 800:** `#1f2937` - Footer background

---

## 10. User Experience (UX)

### 10.1. Feedback Mechanisms
1. **Loading States:**
   - Button disabled: Visual feedback
   - Spinner: Processing indicator
   - Progress bar: Real-time processing

2. **Error Handling:**
   - Red alert box: Clear error messages
   - Input validation: Prevent empty submissions
   - Disabled states: Prevent invalid actions

3. **Success Feedback:**
   - Alert messages: Confirm successful actions
   - Table updates: Immediate data display
   - State changes: Tab enablement

### 10.2. Progressive Disclosure
- Start with Upload tab (logical first step)
- Search disabled until documents indexed
- Warning message guides user to upload first

### 10.3. Performance Optimizations
1. **Streaming:** Prevents UI freeze during long operations
2. **Text truncation:** `max-w-md truncate` for performance
3. **Conditional rendering:** Only render active tab
4. **Debouncing:** Could add for search input (future)

---

## 11. Accessibility

### 11.1. Keyboard Navigation
- Tab navigation between buttons
- Enter key: Trigger search
- Focus states: Visible outlines

### 11.2. Semantic HTML
- `<header>`, `<main>`, `<footer>` tags
- `<table>` for tabular data
- `<button>` for interactive elements

### 11.3. Color Contrast
- WCAG AA compliant
- High contrast text on backgrounds
- Clear focus indicators

---

## 12. Future Enhancements

### 12.1. Planned Features
- [ ] Drag & drop file upload
- [ ] TF-IDF matrix visualization
- [ ] Export results to CSV/Excel
- [ ] Pagination for large result sets
- [ ] Dark mode support
- [ ] Document preview modal
- [ ] Search history
- [ ] Advanced filters

### 12.2. Performance Improvements
- [ ] Virtual scrolling for large tables
- [ ] Lazy loading for document content
- [ ] Cache search results
- [ ] Debounced search input
- [ ] Optimistic UI updates

---

## 13. Testing Checklist

### 13.1. Functional Testing
- [ ] Upload with valid folder path
- [ ] Upload with invalid folder path
- [ ] Search with valid query
- [ ] Search without indexing first
- [ ] Empty search query validation
- [ ] Tab switching maintains state
- [ ] Progress bar updates correctly
- [ ] Error messages display properly

### 13.2. UI/UX Testing
- [ ] Responsive on mobile devices
- [ ] Tables scroll horizontally on small screens
- [ ] Buttons show hover effects
- [ ] Loading states are clear
- [ ] Colors are accessible
- [ ] Text is readable

### 13.3. Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Appendix: Component Hierarchy

```
App (page.tsx)
├── Header
├── Main Container
│   ├── Tab Navigation
│   ├── Error Alert (conditional)
│   │
│   ├── Upload Tab (conditional)
│   │   ├── Upload Form Card
│   │   │   ├── Path Input
│   │   │   ├── Load Button
│   │   │   └── Help Text
│   │   ├── Progress Indicator (conditional)
│   │   │   ├── Progress Header
│   │   │   ├── Progress Bar
│   │   │   └── Status Text
│   │   ├── Loading Spinner (conditional)
│   │   └── Document Table (conditional)
│   │       └── DocumentTable Component
│   │
│   └── Search Tab (conditional)
│       ├── Search Form Card
│       │   ├── Search Input
│       │   ├── Search Button
│       │   └── Warning (conditional)
│       ├── Search Results Info (conditional)
│       ├── Search Results Table (conditional)
│       │   └── SearchResultsTable Component
│       └── Loading Spinner (conditional)
│
└── Footer
```

---

**Dokumen ini menjelaskan tampilan dan behavior dari frontend Next.js Sistem Temu Balik Dokumen v2.0**
