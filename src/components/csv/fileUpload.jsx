import { useState } from "react";
import { FiUpload } from "react-icons/fi";

const FileUpload = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileUpload(event);
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onFileUpload({ target: { files: [file] } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-40 cursor-pointer border-2 ${
          isDragActive ? "border-green-600 bg-green-50" : "border-gray-300"
        } rounded-md p-4 transition duration-300 hover:border-green-600`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <FiUpload size={40} className="text-gray-600 mb-2" />
        <span className="text-gray-700 font-medium">
          {fileName
            ? fileName
            : "Drag and drop your file here or click to upload"}
        </span>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <p className="text-sm text-gray-500 mt-2">
        Supports .xlsx and .xls files
      </p>
    </div>
  );
};

export default FileUpload;
