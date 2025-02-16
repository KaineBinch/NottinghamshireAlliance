const ActionButtons = ({ onDownloadCSV, onUploadToStrapi }) => {
  return (
    <div className="flex flex-col">
      {typeof onDownloadCSV === "function" && (
        <div>
          <button
            onClick={onDownloadCSV}
            className="text-gray-700 text-sm mb-4">
            Download CSV
          </button>
        </div>
      )}
      {typeof onUploadToStrapi === "function" && (
        <div className="py-5">
          <button
            onClick={onUploadToStrapi}
            className="bg-[#214A27] text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300">
            Publish
          </button>
        </div>
      )}
    </div>
  )
}

export default ActionButtons
