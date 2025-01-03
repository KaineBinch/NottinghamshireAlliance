import { useState } from "react";
import DownloadTemplateButton from "./downloadTemplate";

const TemplateCard = () => {
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("07:30"); // Default start time
  const [endTime, setEndTime] = useState("14:00"); // Default end time

  return (
    <div className="h-full flex flex-col space-y-4 bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-center">Download Templates</h2>
      <p className="my-6">
        Here, you can download a spreadsheet template for a specific date.
      </p>
      <div className="flex flex-col space-y-4">
        <div>
          <label className="text-sm font-medium mb-2">Select Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-between">
          <div className="flex-1 mr-2">
            <label className="text-sm font-medium mb-2">First Tee</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex-1 ml-2">
            <label className="text-sm font-medium mb-2">Last Tee</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <DownloadTemplateButton
          eventDate={eventDate}
          startTime={startTime}
          endTime={endTime}
        />
      </div>
    </div>
  );
};

export default TemplateCard;
