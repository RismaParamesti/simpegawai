/**
 * Reusable pagination for tables.
 */
export default function Pagination({
  page,
  totalPages,
  onChangePage,
  itemsPerPage = 10,
  disabled = false,
}) {
  const normalizedTotalPages = Math.max(1, Number(totalPages) || 1);
  const normalizedPage = Math.min(
    Math.max(1, Number(page) || 1),
    normalizedTotalPages,
  );
  const handleFirstPage = () => onChangePage(1);
  const handlePrevPage = () => onChangePage(Math.max(1, normalizedPage - 1));
  const handleNextPage = () =>
    onChangePage(Math.min(normalizedPage + 1, normalizedTotalPages));
  const handleLastPage = () => onChangePage(normalizedTotalPages);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="text-sm opacity-70">
        Menampilkan halaman{" "}
        <span className="font-semibold">{normalizedPage}</span> dari{" "}
        <span className="font-semibold">{normalizedTotalPages}</span> halaman
        <span className="ml-2 text-xs opacity-60">
          ({itemsPerPage} item per halaman)
        </span>
      </div>

      <div className="join">
        <button
          className="join-item btn btn-sm"
          disabled={normalizedPage <= 1 || disabled}
          onClick={handleFirstPage}
          title="Halaman Pertama"
        >
          Awal
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={normalizedPage <= 1 || disabled}
          onClick={handlePrevPage}
        >
          Sebelumnya
        </button>
        <button className="join-item btn btn-sm btn-primary btn-disabled">
          {normalizedPage}
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={normalizedPage >= normalizedTotalPages || disabled}
          onClick={handleNextPage}
        >
          Selanjutnya
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={normalizedPage >= normalizedTotalPages || disabled}
          onClick={handleLastPage}
          title="Halaman Terakhir"
        >
          Akhir
        </button>
      </div>
    </div>
  );
}
