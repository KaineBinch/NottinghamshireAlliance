const HomePageHeader = ({ title, subtext, btnName, btnStyle }) => {
  return (
    <>
      <div className="mx-5 place-content-center text-start text-black max-w-5xl flex flex-col grow">
        <div className="flex flex-col py-[50px]">
          <h1 className="text-left">{title}</h1>
          <div className="flex justify-between items-center ">
            <p className="pr-5">{subtext}</p>
            <a
              className={`btn rounded-none w-[125px] border-black ${btnStyle}`}
              href="/#/fixtures"
            >
              {btnName}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
export default HomePageHeader;
