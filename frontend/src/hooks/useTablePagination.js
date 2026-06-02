import { useEffect, useMemo, useState } from "react";

export default function useTablePagination(items, itemsPerPage = 10) {
  const [page, setPage] = useState(1);
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const totalPages = Math.max(1, Math.ceil(safeItems.length / itemsPerPage));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return safeItems.slice(startIndex, startIndex + itemsPerPage);
  }, [safeItems, page, itemsPerPage]);

  return {
    page,
    setPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    startIndex: (page - 1) * itemsPerPage,
  };
}
