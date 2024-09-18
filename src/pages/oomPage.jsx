import PageHeader from "../components/pageHeader";
import { results } from "../constants/results";
import { transformResults } from "../utils/transformResults";
import ResultsTable from "../components/resultsTable/resultsTable";

const OrderOfMeritPage = () => {
  const { rows, columns } = transformResults(results);

  return (
    <>
      <PageHeader title="Order of Merit" />
      <hr className="border-black" />
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <p>
            Welcome to the Order of Merit leaderboard. Here, you{"'"}ll find the
            latest rankings showcasing the top performers.
          </p>
          <p className="pt-5">
            Stay updated with our leaderboard to track progress and plan your
            next steps.
          </p>
        </div>
        <hr className="border-black" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <ResultsTable columns={columns} rows={rows} />
      </div>
    </>
  );
};

export default OrderOfMeritPage;
