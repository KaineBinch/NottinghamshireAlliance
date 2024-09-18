import { useParams } from "react-router-dom";
import { clubs } from "../constants/golfClubs";

const FurtherResultsPage = () => {
  const { clubName } = useParams();

  const club = clubs.find(
    (c) => c.name.toLowerCase() === clubName.toLowerCase()
  );

  if (!club) {
    return <p>Club not found</p>; // If the club is not found, show a fallback
  }

  return (
    <>
      <div className="max-w-5xl mx-auto w-full">
        <div className="pt-[85px] text-black h-40px pb-[25px] w-full px-4 sm:px-6 lg:px-8">
          <div className="p-4 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold">{club.name}</h1>
            <p>{club.comp} competition</p>
            <p>Date: {club.date}</p>
            {/* Add any other detailed information about the club results */}
            {/* You can display more details, stats, results, etc. */}
          </div>
        </div>
      </div>
    </>
  );
};

export default FurtherResultsPage;
