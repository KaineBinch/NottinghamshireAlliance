const OOMSection = () => {
  return (
    <>
      <div className="flex place-content-center">
        <div className="text-start px-5 py-[50px] text-black max-w-5xl flex flex-col grow">
          <h1>Order Of Merit Standings</h1>
          <div className="flex items-center place-content-between">
            <p className="py-6 pr-5">
              Click here to check on the current standings.
            </p>
            <a
              className="btn rounded-none w-[125px] border-black text-white bg-[#214A27]"
              href="/#/results"
            >
              Results
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default OOMSection;
