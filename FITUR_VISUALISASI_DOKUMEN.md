# Dokumentasi Fitur Visualisasi Detail Dokumen

## Overview

Fitur visualisasi detail dokumen adalah modal interaktif yang menampilkan **informasi lengkap** tentang sebuah dokumen, termasuk konten original, hasil preprocessing, dan statistik mendalam. Fitur ini membantu pengguna memahami bagaimana dokumen diproses dan menganalisis karakteristik dokumen secara detail.

---

## 🎯 Tujuan Fitur

1. **Transparansi Preprocessing**: Menampilkan teks original dan hasil preprocessing secara berdampingan
2. **Analisis Mendalam**: Memberikan statistik lengkap tentang dokumen (word count, token frequency, dll)
3. **Readability**: Format teks dengan paragraf yang proper, bukan plain text mentah
4. **Searchability**: Kemampuan mencari kata tertentu dalam dokumen
5. **Exportability**: Fitur copy dan download dokumen

---

## 🎨 Komponen Utama

### 1. DocumentDetailModal Component

**Lokasi**: `src/components/document-retrieval/DocumentDetailModal.tsx`

**Props Interface**:

```typescript
interface DocumentDetailModalProps {
  document: DocumentDetail | null; // Data dokumen
  isOpen: boolean; // State modal terbuka/tertutup
  onClose: () => void; // Handler untuk menutup modal
}

interface DocumentDetail {
  id: number;
  filename: string;
  file_path: string;
  original_text: string; // Teks original lengkap
  processed_text: string; // Teks setelah preprocessing
  tokens: string[]; // Array token setelah stemming
  word_count: number;
}
```

---

## 📑 Tab Navigation System

Modal menggunakan **3 tab** untuk mengorganisir informasi:

### Tab 1: Original (Preview Dokumen Asli)

**Fitur**:

- ✅ **Formatted Text Display**
  - Text dipecah menjadi paragraf berdasarkan double newline (`\n\n`)
  - Setiap paragraf memiliki spacing yang proper
  - `whitespace-pre-wrap` untuk preserve line breaks dalam paragraf
- ✅ **Search Functionality**

  - Input search untuk mencari kata dalam dokumen
  - Highlight search term dengan `<mark>` tag (background kuning)
  - Case-insensitive search
  - Clear button untuk reset search

- ✅ **Action Buttons**

  - **Copy**: Copy seluruh teks ke clipboard
  - **Download**: Download dokumen sebagai `.txt` file
  - Visual feedback saat berhasil copy (checkmark icon)

- ✅ **Scrollable Content**
  - Menggunakan `ScrollArea` component dari shadcn/ui
  - Maksimal height dengan scroll untuk dokumen panjang
  - Custom scrollbar styling

**Kode Penting - Text Formatting**:

```typescript
const formattedOriginalText = useMemo(() => {
  return document.original_text
    .split(/\n{2,}/) // Split by 2+ newlines (paragraf)
    .filter((para) => para.trim().length > 0);
}, [document.original_text]);
```

**Render dengan Paragraf**:

```tsx
{
  formattedOriginalText.map((paragraph, idx) => (
    <p
      key={idx}
      className="mb-4 text-foreground leading-relaxed whitespace-pre-wrap"
    >
      {highlightText(paragraph, searchTerm)}
    </p>
  ));
}
```

**Highlight Function**:

```typescript
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
```

---

### Tab 2: Processed (Hasil Preprocessing)

**Fitur**:

- ✅ **Info Banner**: Menjelaskan tahap preprocessing yang dilakukan
- ✅ **Reduction Stats Cards**: 3 card dengan gradient background

  - **Reduksi Kata**: Persentase pengurangan jumlah kata
  - **Unique Tokens**: Jumlah token unik vs total
  - **Average Word Length**: Rata-rata panjang kata dalam karakter

- ✅ **Token Display**
  - Semua tokens ditampilkan sebagai `Badge` components
  - Font monospace untuk clarity
  - Wrap layout dengan gap spacing
  - Scrollable untuk dokumen dengan banyak token

**Kode - Reduction Calculation**:

```typescript
const reductionPercentage = (
  ((originalWords.length - document.tokens.length) / originalWords.length) *
  100
).toFixed(1);
```

**Visual Display**:

```tsx
<div
  className="px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 
                dark:from-green-950/20 dark:to-emerald-950/20 
                border border-green-200 dark:border-green-800 rounded-lg"
>
  <div className="flex items-center gap-2 mb-1">
    <TrendingUp className="w-4 h-4 text-green-600" />
    <span className="text-xs font-medium">Reduksi Kata</span>
  </div>
  <p className="text-2xl font-bold text-green-700">
    {statistics.reductionPercentage}%
  </p>
  <p className="text-xs text-green-600 mt-1">
    {statistics.originalWordCount} → {statistics.tokenCount} kata
  </p>
</div>
```

---

### Tab 3: Statistik (Analisis Mendalam)

**Fitur**:

- ✅ **Overview Statistics Grid**: 8 stat cards

  - Total Kata (Original)
  - Unique Words (Original)
  - Total Tokens
  - Unique Tokens
  - Total Karakter
  - Karakter tanpa spasi
  - Jumlah Paragraf
  - Persentase Reduksi

- ✅ **Top 10 Most Frequent Tokens**

  - Ranked list dengan nomor urut
  - Menampilkan frekuensi absolut (count) dan relatif (percentage)
  - Progress bar visual untuk setiap token
  - Progress bar width relatif terhadap token paling sering

- ✅ **Processing Impact Comparison**
  - 2 cards side-by-side
  - **Before Preprocessing**: Stats original text
  - **After Preprocessing**: Stats setelah preprocessing
  - Diversity metric: `(unique words / total words) * 100`

**Kode - Statistics Calculation**:

```typescript
const statistics = useMemo(() => {
  const originalWords = document.original_text.split(/\s+/).filter(Boolean);
  const uniqueOriginalWords = new Set(
    originalWords.map((w) => w.toLowerCase())
  );

  // Token frequency
  const tokenFrequency: { [key: string]: number } = {};
  document.tokens.forEach((token) => {
    tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
  });

  const topTokens = Object.entries(tokenFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const charCount = document.original_text.length;
  const charCountNoSpaces = document.original_text.replace(/\s/g, "").length;

  return {
    originalWordCount: originalWords.length,
    uniqueOriginalWords: uniqueOriginalWords.size,
    tokenCount: document.tokens.length,
    uniqueTokens: new Set(document.tokens).size,
    topTokens,
    charCount,
    charCountNoSpaces,
    // ... more stats
  };
}, [document]);
```

**Top Tokens Display dengan Progress Bar**:

```tsx
{
  statistics.topTokens.map(([token, count], idx) => {
    const percentage = ((count / statistics.tokenCount) * 100).toFixed(1);
    return (
      <div
        key={idx}
        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
      >
        {/* Rank Badge */}
        <div
          className="flex items-center justify-center w-8 h-8 
                      bg-primary/10 text-primary rounded-full text-sm font-bold"
        >
          {idx + 1}
        </div>

        <div className="flex-1">
          {/* Token dan Frequency */}
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-semibold">{token}</span>
            <span className="text-sm text-muted-foreground">
              {count}x ({percentage}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60"
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
  });
}
```

---

## 🔄 Integration dengan Page

### 1. State Management

**Di `page.tsx`**:

```typescript
// State untuk modal
const [selectedDocument, setSelectedDocument] = useState<DocumentDetail | null>(
  null
);
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 2. Fetch Document Detail

**Handler Function**:

```typescript
const handleDocumentClick = async (docId: string) => {
  try {
    const response = await fetch(`http://localhost:8000/api/document/${docId}`);
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
```

**API Response Structure**:

```json
{
  "status": "success",
  "document": {
    "id": 0,
    "filename": "dokumen1.txt",
    "file_path": "C:/dataset/dokumen1.txt",
    "original_text": "Full original text...",
    "processed_text": "full original text",
    "tokens": ["full", "original", "text"],
    "word_count": 3
  }
}
```

### 3. Update DocumentCard

**Props Modification**:

```typescript
interface DocumentCardProps {
  // ... existing props
  onClick?: () => void; // NEW: Handler untuk click
}
```

**Card Interactivity**:

```tsx
<div
  className="... cursor-pointer hover:scale-[1.02] transition-all"
  onClick={onClick}
>
  {/* ... card content ... */}

  {/* View Detail Button */}
  <div className="mt-4 pt-4 border-t border-border/50">
    <Button variant="ghost" className="w-full group-hover:bg-primary/10">
      <Eye className="w-4 h-4 mr-2" />
      Lihat Detail
    </Button>
  </div>
</div>
```

**Usage**:

```tsx
<DocumentCard
  // ... other props
  onClick={() => handleDocumentClick(doc.id)}
/>
```

### 4. Modal Rendering

**Di akhir return statement**:

```tsx
<DocumentDetailModal
  document={selectedDocument}
  isOpen={isModalOpen}
  onClose={handleCloseModal}
/>
```

---

## 🎨 Styling & Design System

### Color Palette

**Stats Cards - Gradient Backgrounds**:

- 🟢 **Green**: Reduksi kata (positif/sukses)
- 🟣 **Purple**: Unique tokens (uniq/special)
- 🟡 **Amber**: Average word length (info)
- 🔵 **Blue**: Before preprocessing
- 🟢 **Emerald**: After preprocessing

**Class Examples**:

```css
/* Green Success */
bg-gradient-to-br from-green-50 to-emerald-50
dark:from-green-950/20 dark:to-emerald-950/20
border-green-200 dark:border-green-800

/* Purple Unique */
bg-gradient-to-br from-purple-50 to-violet-50
dark:from-purple-950/20 dark:to-violet-950/20
border-purple-200 dark:border-purple-800
```

### Typography

**Formatted Text**:

- `leading-relaxed`: Line height 1.625 untuk readability
- `whitespace-pre-wrap`: Preserve whitespace dan line breaks
- `prose prose-sm`: Tailwind Typography plugin

**Code/Token Display**:

- `font-mono`: Monospace font untuk tokens
- `Badge` component dengan `variant="secondary"`

---

## 📱 Responsive Design

### Modal Size

```tsx
<DialogContent className="max-w-6xl max-h-[90vh] p-0">
```

- Desktop: 72rem (1152px) maksimal width
- Height: 90vh dengan scroll
- Mobile: Full width dengan padding

### Grid Layouts

**Stats Cards**:

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
```

- Mobile: 2 kolom
- Desktop: 4 kolom

**Reduction Stats**:

```tsx
<div className="grid grid-cols-3 gap-4">
```

- Always 3 kolom (stacked on mobile jika perlu)

**Comparison Cards**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

- Mobile: 1 kolom (stacked)
- Desktop: 2 kolom side-by-side

---

## ⚡ Performance Optimizations

### 1. useMemo untuk Expensive Calculations

**Text Formatting**:

```typescript
const formattedOriginalText = useMemo(() => {
  return document.original_text.split(/\n{2,}/).filter(Boolean);
}, [document.original_text]);
```

- Hanya recalculate jika `original_text` berubah
- Prevent re-render lag

### 2. Statistics Memoization

```typescript
const statistics = useMemo(() => {
  // All calculation logic
  return { ... };
}, [document]);
```

- Complex calculations di-cache
- Dependency: hanya `document` object

### 3. Conditional Rendering

**Highlight hanya jika ada search**:

```typescript
const highlightText = (text: string, search: string) => {
  if (!search.trim()) return text; // Early return
  // ... highlight logic
};
```

---

## 🔧 Backend API Endpoint

### Endpoint: `GET /api/document/{doc_id}`

**Request**:

```
GET http://localhost:8000/api/document/5
```

**Response Success (200)**:

```json
{
  "status": "success",
  "document": {
    "id": 5,
    "filename": "machine_learning.txt",
    "file_path": "C:/dataset/machine_learning.txt",
    "original_text": "Machine Learning adalah cabang dari...",
    "processed_text": "machine learn cabang...",
    "tokens": ["machine", "learn", "cabang", "..."],
    "word_count": 150
  }
}
```

**Error Response (404)**:

```json
{
  "detail": "Dokumen tidak ditemukan"
}
```

**Backend Implementation** (`main.py`):

```python
@app.get("/api/document/{doc_id}")
def get_document_detail(doc_id: int):
    try:
        if not state.is_indexed or doc_id >= len(state.processed_docs):
            raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

        doc = state.processed_docs[doc_id]

        return {
            "status": "success",
            "document": {
                "id": doc_id,
                "filename": doc['filename'],
                "file_path": doc['file_path'],
                "original_text": doc['original_text'],
                "processed_text": doc['processed_text'],
                "tokens": doc['tokens'],
                "word_count": doc['word_count']
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
```

---

## 🚀 User Flow

```
1. User melihat list dokumen di tab "Dataset & Indexing"
   ↓
2. User klik salah satu DocumentCard (atau klik button "Lihat Detail")
   ↓
3. handleDocumentClick() dipanggil dengan doc.id
   ↓
4. Frontend fetch ke GET /api/document/{doc_id}
   ↓
5. Backend return full document data
   ↓
6. setSelectedDocument(data.document)
7. setIsModalOpen(true)
   ↓
8. Modal muncul dengan 3 tabs
   ↓
9. User bisa:
   - Baca teks original dengan search
   - Lihat tokens hasil preprocessing
   - Analisis statistik dokumen
   - Copy atau download dokumen
   ↓
10. User klik X atau area luar modal
    ↓
11. onClose() dipanggil
12. setIsModalOpen(false)
13. setSelectedDocument(null)
```

---

## 🎯 Use Cases

### 1. Memahami Preprocessing

**Scenario**: User ingin tahu bagaimana preprocessing mengubah dokumennya

**Flow**:

1. Buka dokumen di modal
2. Tab "Original": Lihat teks asli
3. Tab "Processed": Lihat hasil preprocessing
4. Compare: Lihat perbedaan secara visual

**Benefit**: Transparansi dan pemahaman tentang algoritma

---

### 2. Analisis Konten Dokumen

**Scenario**: User ingin tahu kata apa yang paling sering muncul

**Flow**:

1. Buka modal
2. Tab "Statistik"
3. Scroll ke "Top 10 Token"
4. Analisis kata-kata paling frequent

**Benefit**: Content analysis dan keyword extraction

---

### 3. Export Dokumen

**Scenario**: User ingin save dokumen ke file lain

**Flow**:

1. Buka modal
2. Tab "Original"
3. Klik button "Download"
4. File `.txt` ter-download

**Benefit**: Data portability

---

### 4. Search Dalam Dokumen

**Scenario**: User mencari kata spesifik dalam dokumen panjang

**Flow**:

1. Buka modal
2. Tab "Original"
3. Type kata di search box
4. Semua occurrence di-highlight kuning

**Benefit**: Quick navigation dalam long document

---

## 📊 Statistik yang Dihitung

| Statistik                 | Deskripsi                           | Formula                                  |
| ------------------------- | ----------------------------------- | ---------------------------------------- |
| **Total Kata (Original)** | Jumlah kata sebelum preprocessing   | `text.split(/\s+/).length`               |
| **Unique Words**          | Jumlah kata unik (case-insensitive) | `new Set(words.map(toLowerCase)).size`   |
| **Total Tokens**          | Jumlah token setelah preprocessing  | `tokens.length`                          |
| **Unique Tokens**         | Jumlah token unik                   | `new Set(tokens).size`                   |
| **Reduksi Kata**          | Persentase pengurangan kata         | `((original - tokens) / original) * 100` |
| **Avg Word Length**       | Rata-rata panjang kata              | `sum(token.length) / tokens.length`      |
| **Paragraf**              | Jumlah paragraf                     | `split(/\n{2,}/).length`                 |
| **Total Karakter**        | Termasuk spasi                      | `text.length`                            |
| **Karakter (no space)**   | Tanpa spasi                         | `text.replace(/\s/g, '').length`         |
| **Diversity**             | Rasio unique/total                  | `(unique / total) * 100`                 |

---

## 🎨 Component Dependencies

```
DocumentDetailModal
├── shadcn/ui
│   ├── Dialog, DialogContent, DialogHeader
│   ├── Button
│   ├── Input
│   ├── Badge
│   ├── ScrollArea
│   └── Tabs, TabsList, TabsTrigger, TabsContent
├── lucide-react
│   ├── FileText, Copy, Download
│   ├── Search, BarChart3, FileCode
│   ├── X, CheckCircle2, AlertCircle
│   ├── TrendingUp, Hash, Clock
│   └── Eye (for DocumentCard button)
└── React
    ├── useState
    └── useMemo
```

---

## 🔮 Future Enhancements

### Potential Features:

1. **Syntax Highlighting**: Jika dokumen berisi code
2. **PDF Export**: Export dokumen sebagai PDF dengan styling
3. **Comparison Mode**: Bandingkan 2 dokumen side-by-side
4. **Annotation**: User bisa add notes pada dokumen
5. **Word Cloud**: Visualisasi token frequency dengan word cloud
6. **N-gram Analysis**: Bigrams dan trigrams paling sering
7. **Reading Time**: Estimasi waktu baca dokumen
8. **Language Detection**: Deteksi bahasa dokumen otomatis
9. **Share Link**: Generate shareable link untuk dokumen
10. **Print View**: Optimized layout untuk print

---

## ✅ Checklist Testing

### Functionality:

- [ ] Modal terbuka saat klik DocumentCard
- [ ] Modal tertutup saat klik X atau area luar
- [ ] Tab switching berfungsi lancar
- [ ] Search highlight kata dengan benar
- [ ] Copy to clipboard berhasil
- [ ] Download file berfungsi
- [ ] Statistik dihitung dengan akurat
- [ ] Tokens ditampilkan semua

### Responsiveness:

- [ ] Desktop: Layout 3 kolom untuk stats
- [ ] Tablet: Layout 2 kolom
- [ ] Mobile: Layout 1 kolom stacked
- [ ] Modal scrollable pada dokumen panjang
- [ ] Text tidak overflow

### Performance:

- [ ] Modal load cepat (<500ms)
- [ ] Smooth scrolling
- [ ] No lag saat typing di search
- [ ] useMemo mencegah recalculation

### Accessibility:

- [ ] Keyboard navigation (Tab, Esc)
- [ ] Focus states visible
- [ ] Screen reader friendly
- [ ] Contrast ratio memenuhi WCAG

---

Fitur visualisasi detail dokumen ini memberikan user experience yang **comprehensive** dan **professional** untuk analisis dokumen! 🚀
