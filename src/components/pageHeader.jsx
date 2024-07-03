const PageHeader = ({ title }) => {
  return (
    <>
      <div className="max-w-5xl mx-auto w-full">
        <div className="pt-[85px] text-black h-40px pb-[25px] w-full px-4 sm:px-6 lg:px-8">
          <h1 className="text-left">{title}</h1>
        </div>
      </div>
    </>
  );
};
export default PageHeader;
