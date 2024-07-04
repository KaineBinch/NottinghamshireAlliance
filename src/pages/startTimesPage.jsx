import PageHeader from "../components/pageHeader";
import TeeTimesTable from "../components/teeTime";

const StartTimesPage = () => {
  return (
    <>
      <PageHeader title="Order of Play" />
      <hr className="border-black" />
      <div className="bg-[#d9d9d9]">
        <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-start">
          <p>
            Please advise any changes and / or details of ‘unnamed’ players by
            17:00 Monday prior to the event at the latest
          </p>
          <p className="py-5">
            Please collect your scorecard at least 10 minutes before your start
            time
          </p>
          <p>
            Entry fee payable if you fail to arrive without prior notification.
          </p>
        </div>
        <hr className="border-black mt-5" />
      </div>
      <div className="flex justify-center">
        <div className="max-w-5xl w-full">
          <div className="m-5">
            <TeeTimesTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default StartTimesPage;
