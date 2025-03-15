const HomePageHeader = ({ title, subtext, btnName, btnStyle, page }) => {
  return (
    <div className="flex justify-center w-full">
      <div className="text-start text-black max-w-5xl flex flex-col grow px-5">
        <h1 className="pt-[35px] pb-[10px] lg:pb-[0px]">{title}</h1>
        <div className="flex justify-between pb-[50px]">
          <div className="flex flex-col justify-end text-left">
            <p className="pr-5 pl-[3px]">{subtext}</p>
          </div>
          <div className="flex flex-col justify-end">
            <a
              className={`btn rounded-none w-[125px] border-black ${btnStyle}`}
              href={`/${page}`}>
              {btnName}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePageHeader
