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
  const handleFirstPage = () => onChangePage(1);
  const handlePrevPage = () => onChangePage(Math.max(1, page - 1));
  const handleNextPage = () =>
    onChangePage(Math.min(page + 1, totalPages || 1));
  const handleLastPage = () => onChangePage(totalPages || 1);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
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
          Awal
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={page <= 1 || disabled}
          onClick={handlePrevPage}
        >
          Sebelumnya
        </button>
        <button className="join-item btn btn-sm btn-primary btn-disabled">
          {page}
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={page >= totalPages || disabled}
          onClick={handleNextPage}
        >
          Selanjutnya
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={page >= totalPages || disabled}
          onClick={handleLastPage}
          title="Halaman Terakhir"
        >
          Akhir
        </button>
      </div>
    </div>
  );
}
