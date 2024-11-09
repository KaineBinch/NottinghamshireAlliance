import { useState } from "react";
import { useParams } from "react-router-dom";
import { Trophy, Users, User } from "lucide-react";
import { clubs } from "../constants/golfClubs";

const ExpandableText = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  const fullText = `If a club has had better greens than Radcliffe's yesterday, I’m not aware of it. Every player commented on how superbly they rolled, and the holes were cut really sharp. Congratulations to the green staff! It’s a shame that we had a reduced field due to a PGA event, with lots of regulars away on various trips. Some super scores were made, and it was nice to see new names picking up prizes. Thanks to Karen and Nicola behind the bar for looking after us all day. Here’s to next year’s visit! Our next event is a Pairs Better Ball at Brierley Forest on Wednesday, October 2nd.`;

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    return truncated.slice(0, truncated.lastIndexOf(" ")) + " ";
  };

  return (
    <div className="px-5 my-[25px] text-start">
      {isExpanded ? fullText : truncateText(fullText, 250)}
      <button onClick={toggleExpand} className="font-bold text-[#214A27]">
        {isExpanded ? "Read Less" : "Read More..."}
      </button>
    </div>
  );
};

const TabButton = ({ id, label, icon: Icon, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`md:px-4 py-2 font-semibold text-sm md:text-lg ${
      activeTab === id
        ? "text-[#214A27] border-b-2 border-[#214A27]"
        : "text-gray-700 hover:text-[#214A27]"
    } flex items-center mx-3`}
  >
    <Icon className="mr-2" size={20} />
    {label}
  </button>
);

const ResultTable = ({ headers, data }) => (
  <div className="overflow-x-auto text-sm md:text-lg">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#214A27] text-white">
          {headers.map((header, index) => (
            <th key={index} className="border p-2 text-center ">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
          >
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border p-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const WinnersTab = () => (
  <ResultTable
    headers={["Position", "Name", "Club", "Points"]}
    data={[
      ["1st", "Peter Higgins", "Wollaton Park", "42"],
      ["2nd", "Mike Flanagan", "Wollaton Park", "41"],
    ]}
  />
);

const TeamsTab = () => (
  <div>
    <h2 className="text-xl text-start font-semibold my-4">
      1st: Oakmere Park (144 Points)
    </h2>
    <ResultTable
      headers={["Name", "Points"]}
      data={[
        ["Glenn Woolley", "39"],
        ["Ian Dallas", "33"],
        ["Jon Santiago", "35"],
        ["Neil Goodwin", "37"],
      ]}
    />
    <h3 className="text-xl text-start font-semibold mt-10 mb-4">
      2nd: Bondhay (141 Points)
    </h3>
    <ResultTable
      headers={["Name", "Points"]}
      data={[
        ["Reece Samson", "35"],
        ["Clive Ardrone", "35"],
        ["Steve Bates", "35"],
        ["Mark Highfield", "36"],
      ]}
    />
  </div>
);

const ProfessionalsTab = () => (
  <ResultTable
    headers={["Place", "Name", "Club", "Points", "Prize"]}
    data={[
      ["1st", "Louis Willey", "Beeston Fields", "35", "£180"],
      ["1st", "Reece Samson", "Bondhay", "35", "£180"],
      ["3rd", "Callum Fern", "Beeston Fields", "34", "£90"],
      ["3rd", "Reece Samson", "Bondhay", "34", "£90"],
      ["5th", "Louis Willey", "Beeston Fields", "30", "£30"],
      ["5th", "Reece Samson", "Bondhay", "30", "£30"],
    ]}
  />
);

const FurtherResultsPage = () => {
  const { clubName } = useParams();
  const [activeTab, setActiveTab] = useState("winners");

  const tabs = [
    {
      id: "winners",
      label: "Amateur",
      icon: Trophy,
      component: WinnersTab,
    },
    { id: "clubs", label: "Team", icon: Users, component: TeamsTab },
    {
      id: "professionals",
      label: "Professionals",
      icon: User,
      component: ProfessionalsTab,
    },
  ];

  const club = clubs.find(
    (c) => c.name.toLowerCase() === clubName.toLowerCase()
  );

  if (!club) {
    return <p className="text-center mt-8 text-xl">Club not found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-[85px] pb-[25px]">
      <div className="bg-white shadow-md rounded-lg p-6 pb-[25px]">
        <header className="mb-[25px]">
          <h1 className="text-3xl font-bold mt-[20px]">{club.name}</h1>
          <p className="text-xl my-[10px]">{club.comp} competition</p>
          <p className="pb-[10px]">Date: {club.date}</p>
        </header>
        <ExpandableText />
        <nav className="mb-[50px] flex justify-center">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              {...tab}
              activeTab={activeTab}
              onClick={setActiveTab}
            />
          ))}
        </nav>

        <main>{tabs.find((tab) => tab.id === activeTab).component()}</main>
      </div>
    </div>
  );
};

export default FurtherResultsPage;
