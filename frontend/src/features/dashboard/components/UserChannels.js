import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import useTablePagination from "../../../hooks/useTablePagination";

const userSourceData = [
  { source: "Facebook Ads", count: "26,345", conversionPercent: 10.2 },
  { source: "Google Ads", count: "21,341", conversionPercent: 11.7 },
  { source: "Instagram Ads", count: "34,379", conversionPercent: 12.4 },
  { source: "Affiliates", count: "12,359", conversionPercent: 20.9 },
  { source: "Organic", count: "10,345", conversionPercent: 10.3 },
];

function UserChannels() {
  const channelsPagination = useTablePagination(userSourceData);

  return (
    <TitleCard title={"User Signup Source"}>
      {/** Table Data */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="border-b border-base-300/70 text-base-content/60">
              <th className="w-12"></th>
              <th className="normal-case font-medium">Source</th>
              <th className="normal-case font-medium">No of Users</th>
              <th className="normal-case font-medium">Conversion</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-base-300/50">
            {channelsPagination.paginatedItems.map((u, k) => {
              return (
                <tr key={k} className="hover:bg-base-200/60 transition-colors">
                  <th className="text-base-content/60">{k + 1}</th>
                  <td className="font-medium">{u.source}</td>
                  <td>{u.count}</td>
                  <td>
                    <span className="badge badge-ghost rounded-full border border-base-300/70 bg-primary/5 text-primary">
                      {`${u.conversionPercent}%`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={channelsPagination.page} totalPages={channelsPagination.totalPages} onChangePage={channelsPagination.setPage} itemsPerPage={channelsPagination.itemsPerPage} />
      </div>
    </TitleCard>
  );
}

export default UserChannels;
