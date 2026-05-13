/**
 * Pagination Component - Reusable pagination for all tables
 *
 * Props:
 * - page: current page number (required)
 * - totalPages: total number of pages (required)
 * - onChangePage: callback function when page changes (required)
 * - itemsPerPage: optional, display text for items per page (default: 10)
 * - disabled: optional, disable pagination buttons (default: false)
 *
 * Example usage:
 * <Pagination
 *   page={pagination.page}
 *   totalPages={pagination.totalPages}
 *   onChangePage={handleChangePage}
 * />
 */

export default function Pagination({
  page,
  totalPages,
  onChangePage,
  itemsPerPage = 10,
  disabled = false,
}) {
  const handleFirstPage = () => onChangePage(1);
  const handlePrevPage = () => onChangePage(Math.max(1, page - 1));
  const handleNextPage = () =>
    onChangePage(Math.min(page + 1, totalPages || 1));
  const handleLastPage = () => onChangePage(totalPages || 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="text-sm opacity-70">
        Menampilkan halaman <span className="font-semibold">{page}</span> dari{" "}
        <span className="font-semibold">{totalPages}</span> halaman
        <span className="ml-2 text-xs opacity-60">
          ({itemsPerPage} item per halaman)
        </span>
      </div>
      <div className="join">
        <button
          className="join-item btn btn-sm"
          disabled={page <= 1 || disabled}
          onClick={handleFirstPage}
          title="Halaman Pertama"
        >
          ⟨⟨
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={page <= 1 || disabled}
          onClick={handlePrevPage}
        >
          « Sebelumnya
        </button>
        <button className="join-item btn btn-sm btn-disabled">{page}</button>
        <button
          className="join-item btn btn-sm"
          disabled={page >= totalPages || disabled}
          onClick={handleNextPage}
        >
          Selanjutnya »
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={page >= totalPages || disabled}
          onClick={handleLastPage}
          title="Halaman Terakhir"
        >
          ⟩⟩
        </button>
      </div>
    </div>
  );
}
