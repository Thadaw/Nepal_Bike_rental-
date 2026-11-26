import type { Api } from "@/api/contract";
import { hasRemoteApi } from "@/api/endpoints";
import { localApi } from "@/api/local";
import { remoteApi } from "@/api/remote";

export const api: Api = hasRemoteApi ? remoteApi : localApi;
export { ApiError } from "@/api/client";
export { endpoints, hasRemoteApi } from "@/api/endpoints";
export { queryKeys } from "@/api/queryKeys";
export type { Api } from "@/api/contract";
