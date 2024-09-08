import HomePageHeader from "./homepageHeader";
import ResultsTable from "../resultsTable/resultsTable";
import { results } from "../../constants/results";
import { transformResults } from "../../utils/transformResults";

const OOMSection = () => {
  const { rows, columns } = transformResults(results);

  return (
    <>
      <HomePageHeader
        title="Order Of Merit Standings"
        subtext="Click here to check on the current standings"
        btnName="Order of Merit"
        btnStyle="text-white bg-[#214A27]"
        page="oom"
      />
      <div className="max-w-5xl -mt-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Passing the limit prop to show only top 10 results */}
        <ResultsTable columns={columns} rows={rows} limit={12} />
      </div>
    </>
  );
};

export default OOMSection;
