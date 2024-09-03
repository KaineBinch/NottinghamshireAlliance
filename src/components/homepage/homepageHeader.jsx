const HomePageHeader = ({ title, subtext, btnName, btnStyle, page }) => {
  return (
    <div className="flex justify-center w-full">
      <div className="text-start text-black max-w-5xl flex flex-col grow px-5">
        <div className="flex justify-between py-[50px]">
          <div className="flex flex-col text-left">
            <h1 className="pb-[10px]">{title}</h1>
            <p className="pr-5 pl-[3px]">{subtext}</p>
          </div>
          <div className="flex flex-col justify-end">
            <a
              className={`btn rounded-none w-[125px] border-black ${btnStyle}`}
              href={`/#/${page}`}
            >
              {btnName}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageHeader;
