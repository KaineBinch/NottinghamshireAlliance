const PageHeader = ({ title }) => {
  return (
    <>
      <div className="flex">
        <div className="pt-[85px] text-start text-black h-40px pb-[25px] max-w-5xl ml-[25px]">
          <h1>{title}</h1>
        </div>
      </div>
    </>
  );
};
export default PageHeader;
