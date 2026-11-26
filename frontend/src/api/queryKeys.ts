export const queryKeys = {
  vehicles: {
    all: ["vehicles"] as const,
    list: () => ["vehicles", "list"] as const,
    detail: (slug: string) => ["vehicles", "detail", slug] as const,
  },
  destinations: {
    all: ["destinations"] as const,
    list: () => ["destinations", "list"] as const,
    detail: (slug: string) => ["destinations", "detail", slug] as const,
  },
  pricing: {
    all: ["pricing"] as const,
    detail: () => ["pricing", "detail"] as const,
  },
  catalog: {
    all: ["catalog"] as const,
  },
  availability: {
    all: ["availability"] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    public: () => ["reviews", "public"] as const,
    admin: () => ["reviews", "admin"] as const,
    link: (reference: string, key: string) => ["reviews", "link", reference, key] as const,
  },
  bookings: {
    all: ["booking-requests"] as const,
    list: () => ["booking-requests", "list"] as const,
    detail: (id: string) => ["booking-requests", "detail", id] as const,
  },
};
