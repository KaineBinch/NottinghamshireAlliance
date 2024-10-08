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
            Please provide any changes or details regarding ‘unnamed’ players by
            17:00 on the Monday before the event, at the latest.
          </p>
          <p className="py-5">
            Please collect your scorecard at least 10 minutes before your
            scheduled start time.
          </p>
          <p>
            The entry fee will be payable if you fail to arrive without prior
            notification.
          </p>
        </div>
        <hr className="border-black" />
      </div>
      <div className="mt-5">
        <h2>Coxmoor Golf Club</h2>
        <h3>07 March 2024</h3>
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
