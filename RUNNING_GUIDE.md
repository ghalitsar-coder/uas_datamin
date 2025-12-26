# 🚀 Cara Menjalankan Aplikasi Sistem Temu Balik Dokumen

## Arsitektur

```
Frontend (Next.js)      Backend (FastAPI)       Dataset
http://localhost:3000   http://localhost:8000   generator/dataset_sample/
```

## Langkah-Langkah Setup

### 1. Setup Backend (Python/FastAPI)

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python main.py
```

✅ Backend akan running di `http://localhost:8000`
✅ Akses dokumentasi API di `http://localhost:8000/docs`

### 2. Setup Frontend (Next.js)

**Terminal baru:**

```bash
# Masuk ke folder frontend
cd uas_datamin

# Install dependencies (hanya pertama kali)
npm install

# Jalankan development server
npm run dev
```

✅ Frontend akan running di `http://localhost:3000`

### 3. Generate Dataset (Opsional)

Jika belum punya dataset:

**Terminal baru:**

```bash
# Masuk ke folder generator
cd generator

# Generate dataset sample (10 file, 1 halaman)
python generate_data_sample.py

# ATAU generate dataset lengkap (100 file, full content)
python generate_data.py
```

✅ Dataset tersimpan di `generator/dataset_sample/` atau `generator/dataset_tugas_besar/`

## Cara Menggunakan Aplikasi

### Step 1: Upload & Index Dokumen

1. Buka `http://localhost:3000`
2. Di tab **📂 Dataset & Indexing**
3. Masukkan path folder, contoh:
   - Windows: `C:/Kuliah/Semester 5/Data Mining/UAS/generator/dataset_sample`
   - Relative: `../generator/dataset_sample`
4. Klik **📥 Load Dokumen**
5. Tunggu proses indexing selesai
6. Lihat tabel dokumen yang berhasil diindex

### Step 2: Search Dokumen

1. Pindah ke tab **🔍 Pencarian**
2. Masukkan query pencarian, contoh:
   - "teknologi informasi"
   - "sejarah indonesia"
   - "kecerdasan buatan"
3. Klik **Cari** atau tekan Enter
4. Lihat hasil ranking berdasarkan similarity

## Struktur Project

```
UAS/
├── backend/                    # FastAPI Backend
│   ├── main.py                # API routes
│   ├── document_processor.py  # Baca file TXT/PDF/DOCX
│   ├── text_preprocessor.py   # Preprocessing + Sastrawi
│   ├── tfidf_processor.py     # TF-IDF vectorization
│   ├── jaccard_similarity.py  # Generalized Jaccard
│   └── requirements.txt
│
├── uas_datamin/               # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx      # Main UI dengan tabs
│   │   ├── components/       # Reusable components
│   │   ├── lib/
│   │   │   └── api.ts        # API client
│   │   └── types/
│   │       └── index.ts      # TypeScript types
│   └── package.json
│
└── generator/                 # Dataset Generator
    ├── generate_data.py       # Generate 100 file, full content
    ├── generate_data_sample.py # Generate 10 file, ringkasan
    ├── dataset_sample/        # Output dataset sample
    └── dataset_tugas_besar/   # Output dataset lengkap
```

## Troubleshooting

### Backend Error: "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### Frontend Error: "Cannot find module"
```bash
npm install
```

### CORS Error
Pastikan backend running dan CORS sudah enabled di `main.py`

### Path Error saat Upload
- Gunakan absolute path: `C:/full/path/to/folder`
- Atau relative path dari root project: `../generator/dataset_sample`
- Pastikan folder berisi file .txt, .pdf, atau .docx

### Port Already in Use
Backend (8000):
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

Frontend (3000):
```bash
# Gunakan port lain
npm run dev -- -p 3001
```

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8000

# Upload documents
curl -X POST http://localhost:8000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"folder_path": "../generator/dataset_sample"}'

# Search
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "teknologi", "top_k": 5}'
```

### Test Frontend

1. Buka `http://localhost:3000`
2. Test upload dengan path dataset
3. Test search dengan berbagai query
4. Cek console browser untuk errors

## Fitur Utama

✅ Upload & Index dokumen (.txt, .pdf, .docx)
✅ Preprocessing otomatis (Sastrawi)
✅ TF-IDF Vectorization
✅ Generalized Jaccard Similarity
✅ Ranking hasil pencarian
✅ Preview preprocessing steps
✅ Real-time search
✅ Responsive UI

## Tech Stack

**Backend:**
- FastAPI (Python web framework)
- Sastrawi (Indonesian NLP)
- Scikit-learn (TF-IDF)
- PyPDF2 (PDF processing)
- python-docx (DOCX processing)

**Frontend:**
- Next.js 14+ (React framework)
- TypeScript
- Tailwind CSS

## Demo Query Examples

Coba query berikut untuk testing:

1. **"teknologi informasi"** - Cari dokumen tentang IT
2. **"sejarah indonesia merdeka"** - Multi-word query
3. **"kecerdasan buatan machine learning"** - AI topics
4. **"ekonomi digital"** - Business topics
5. **"memakan makanan"** - Test stemming (hasil: "makan")

## Notes

- Backend harus running sebelum frontend
- Dataset minimal 1 dokumen untuk testing
- Preprocessing menggunakan Sastrawi (support Bahasa Indonesia)
- Similarity score 0-1 (1 = identical, 0 = no similarity)
