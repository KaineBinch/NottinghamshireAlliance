import { useState } from "react";
import DownloadTemplate from "../components/downloadTemplate";

const TemplatePage = () => {
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("07:30"); // Default start time
  const [endTime, setEndTime] = useState("14:00"); // Default end time

  return (
    <div className="container mx-auto pt-[75px] p-5">
      <h1
        className="text-2xl font-bold text-center mb-6"
        style={{ color: "#214A27" }}
      >
        Download Templates
      </h1>
      <div className="tee-time/score-spreadsheet mb-10">
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <h2 className="mb-10">Tee Times / Score Spreadsheet</h2>
          <div className="flex flex-row place-content-evenly">
            <div>
              <h3 className="mb-2 font-semibold text-base">Select Date</h3>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="block mb-4 p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-base">First Tee</h3>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="block mb-4 p-2 border border-gray-300 rounded ml-2"
              />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-base">Last Tee</h3>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="block mb-4 p-2 border border-gray-300 rounded ml-2"
              />
            </div>
          </div>
          <div className="pb-5 pt-1">
            <DownloadTemplate
              eventDate={eventDate}
              startTime={startTime}
              endTime={endTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePage;
