import React from "react";
import type { SearchResult } from "@/types";

interface SearchResultsTableProps {
  results: SearchResult[];
}

export default function SearchResultsTable({
  results,
}: SearchResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama File
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skor Jaccard
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cuplikan Teks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jumlah Kata
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result) => (
            <tr
              key={result.doc_index}
              className={`hover:bg-gray-50 ${
                result.similarity > 0.5
                  ? "bg-green-50"
                  : result.similarity > 0.3
                  ? "bg-yellow-50"
                  : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold text-white bg-blue-600 rounded-full">
                  {result.rank}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {result.filename}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900">
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
              <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                {result.original_text}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                {result.word_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Tidak ada hasil ditemukan
        </div>
      )}
    </div>
  );
}
