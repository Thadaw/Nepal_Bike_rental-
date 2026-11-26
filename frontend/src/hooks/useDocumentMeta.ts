import { useEffect } from "react";

const SUFFIX = "Nepal Bike Rental";

export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title === SUFFIX ? title : `${title} | ${SUFFIX}`;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
}
