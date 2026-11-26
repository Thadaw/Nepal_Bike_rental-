const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/+$/, "") || "";

export const hasRemoteApi = base.length > 0;

export const endpoints = {
  vehicles: {
    list: () => `${base}/vehicles`,
    detail: (slug: string) => `${base}/vehicles/${encodeURIComponent(slug)}`,
  },
  destinations: {
    list: () => `${base}/destinations`,
    detail: (slug: string) => `${base}/destinations/${encodeURIComponent(slug)}`,
  },
  pricing: () => `${base}/pricing`,
  catalog: {
    reset: () => `${base}/catalog/reset`,
  },
  uploads: () => `${base}/uploads`,
  availability: () => `${base}/availability`,
  reviews: {
    list: () => `${base}/reviews`,
    admin: () => `${base}/reviews?scope=admin`,
    link: (reference: string, key: string) => `${base}/reviews/link?ref=${encodeURIComponent(reference)}&key=${encodeURIComponent(key)}`,
    detail: (id: string) => `${base}/reviews/${encodeURIComponent(id)}`,
  },
  bookingRequests: {
    list: () => `${base}/booking-requests`,
    detail: (id: string) => `${base}/booking-requests/${encodeURIComponent(id)}`,
    reviewKey: (id: string) => `${base}/booking-requests/${encodeURIComponent(id)}/review-key`,
  },
};
