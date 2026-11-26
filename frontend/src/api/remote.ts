import { ApiError, request } from "@/api/client";
import type { Api } from "@/api/contract";
import { endpoints } from "@/api/endpoints";

async function getOrNull<T>(url: string): Promise<T | null> {
  try {
    return await request<T>(url);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const remoteApi: Api = {
  vehicles: {
    list: () => request(endpoints.vehicles.list()),
    get: (slug) => getOrNull(endpoints.vehicles.detail(slug)),
    create: (input) => request(endpoints.vehicles.list(), { method: "POST", body: input }),
    update: (slug, patch) => request(endpoints.vehicles.detail(slug), { method: "PATCH", body: patch }),
    remove: (slug) => request<void>(endpoints.vehicles.detail(slug), { method: "DELETE" }),
  },
  destinations: {
    list: () => request(endpoints.destinations.list()),
    get: (slug) => getOrNull(endpoints.destinations.detail(slug)),
    create: (input) => request(endpoints.destinations.list(), { method: "POST", body: input }),
    update: (slug, patch) => request(endpoints.destinations.detail(slug), { method: "PATCH", body: patch }),
    remove: (slug) => request<void>(endpoints.destinations.detail(slug), { method: "DELETE" }),
  },
  pricing: {
    get: () => request(endpoints.pricing()),
    update: (input) => request(endpoints.pricing(), { method: "PUT", body: input }),
  },
  catalog: {
    reset: () => request<void>(endpoints.catalog.reset(), { method: "POST" }),
  },
  bookings: {
    list: () => request(endpoints.bookingRequests.list()),
    create: (input) => request(endpoints.bookingRequests.list(), { method: "POST", body: input }),
    updateStatus: ({ id, status }) => request(endpoints.bookingRequests.detail(id), { method: "PATCH", body: { status } }),
    remove: (id) => request<void>(endpoints.bookingRequests.detail(id), { method: "DELETE" }),
    issueReviewKey: (id) => request(endpoints.bookingRequests.reviewKey(id), { method: "POST" }),
  },
  uploads: {
    image: (file) => {
      const form = new FormData();
      form.append("file", file);
      return request(endpoints.uploads(), { method: "POST", body: form });
    },
  },
  availability: {
    blockedRanges: () => request(endpoints.availability()),
  },
  reviews: {
    listPublic: () => request(endpoints.reviews.list()),
    list: () => request(endpoints.reviews.admin()),
    getLink: (reference, key) => request(endpoints.reviews.link(reference, key)),
    submit: (input) => request<void>(endpoints.reviews.list(), { method: "POST", body: input }),
    updateStatus: ({ id, status }) => request(endpoints.reviews.detail(id), { method: "PATCH", body: { status } }),
    remove: (id) => request<void>(endpoints.reviews.detail(id), { method: "DELETE" }),
  },
};
