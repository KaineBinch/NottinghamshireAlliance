import { useState } from "react";
import { FiUpload } from "react-icons/fi";

const FileUpload = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileUpload(event);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="file-upload"
        className="flex items-center cursor-pointer bg-[#214A27] text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
      >
        <FiUpload className="mr-2" />
        <span>{fileName ? "Change File" : "Select File"}</span>
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="hidden"
      />
      {fileName && (
        <p className="mt-3 text-sm text-gray-500">Selected File: {fileName}</p>
      )}
      {!fileName && (
        <p className="text-sm text-gray-500 mt-2">
          Supports .xlsx and .xls files
        </p>
      )}
    </div>
  );
};

export default FileUpload;
