const ActionButtons = ({ onDownloadCSV, onUploadToStrapi }) => {
  return (
    <div className="py-5">
      <button
        onClick={onDownloadCSV}
        className="bg-[#214A27] text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
      >
        Download CSV
      </button>
      <button
        onClick={onUploadToStrapi}
        className="bg-[#214A27] text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300 ml-5"
      >
        Publish
      </button>
    </div>
  );
};

export default ActionButtons;
