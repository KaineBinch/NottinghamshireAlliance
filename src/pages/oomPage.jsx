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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ResultsTable columns={columns} rows={rows} />
      </div>
    </>
  );
};

export default OrderOfMeritPage;