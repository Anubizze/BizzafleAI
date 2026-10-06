import type { DocumentAnalysis, DocumentCategory, DocumentItem } from "@bizaffle/types";
import { apiClient } from "@/lib/api/client";

export const documentsApi = {
  list: (category?: DocumentCategory) =>
    apiClient.get<DocumentItem[]>(
      category ? `/documents?category=${category}&limit=100` : "/documents?limit=100",
    ),
  upload: (file: File, category: DocumentCategory) => {
    const body = new FormData();
    body.append("file", file);
    body.append("category", category);
    return apiClient.post<DocumentItem>("/documents", body);
  },
  analyze: (id: string) => apiClient.post<DocumentAnalysis>(`/documents/${id}/analyze`),
  analysis: (id: string) => apiClient.get<DocumentAnalysis>(`/documents/${id}/analysis`),
  remove: (id: string) => apiClient.delete<{ ok: boolean }>(`/documents/${id}`),
};
