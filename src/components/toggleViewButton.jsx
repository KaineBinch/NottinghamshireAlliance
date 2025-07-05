const ToggleViewButton = ({ isListView, setIsListView }) => {
  return (
    <div className="text-center w-full my-4">
      <button
        onClick={() => setIsListView(!isListView)}
        className="inline-block mx-auto bg-[#214A27] text-white px-6 py-2 rounded-lg shadow-md">
        {isListView ? "Switch to Card View" : "Switch to List View"}
      </button>
    </div>
  )
}

export default ToggleViewButton
