import logo from "../assets/Logo.png";

const MobFoot = () => {
  return (
    <>
      <div className="bg-[#D9D9D9] text-black">
        <div className="flex flex-col items-center justify-center py-8">
          <img className="h-[150px] w-[150px]" src={logo} />
        </div>
        <div className="text-center pb-10">
          <h2 className="text-center mt-[5px] text-md mx-[10px] ">
            <a href="tel:07734924889">
              <span className="font-bold">Telephone: </span>07734 924 889
              <br />
              <br />
            </a>
            <a href="mailto:drivewithglenn@hotmail.co.uk">
              <span className="font-bold">Email: </span>
              drivewithglenn@hotmail.co.uk
            </a>
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center pb-3"></div>
      </div>
      <hr className="border-1 border-neutral mt-8" />
      <p className="flex flex-col py-8 leading-6 text-center text-xs">
        Copyright © 2024 Nottinghamshire Golf Alliance
        <a
          href={"https://kainebinch.dev"}
          target="_blank"
          rel="noreferrer"
          className="pt-4 text-xs"
        >
          Web Design
        </a>
      </p>
    </>
  );
};
export default MobFoot;
