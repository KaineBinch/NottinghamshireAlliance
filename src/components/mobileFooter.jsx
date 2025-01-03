import logo from "../assets/Logo.png";

const MobFoot = () => {
  return (
    <>
      <hr className="border-black mt-10" />
      <div className="bg-[#D9D9D9] text-black">
        <div className="flex flex-col items-center justify-center py-8">
          <img className="h-[150px] w-[150px]" src={logo} />
        </div>
        <div className="text-center pb-10">
          <h2 className="text-center mt-[5px] text-md mx-[10px] font-light">
            <a className="text-base " href="tel:07734924889">
              <span className="font-bold ">
                Telephone <br />
              </span>
              07734 924 889 - Glenn Wooley
              <br />
              <br />
            </a>
            <a className="text-base" href="mailto:drivewithglenn@hotmail.co.uk">
              <span className="font-bold">
                Email <br />
              </span>
              thenapga@hotmail.com
            </a>
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center pb-3"></div>
      </div>
      <hr className="border-1 border-neutral mt-8" />
      <div className="max-w-5xl mx-auto flex flex-col p-5 leading-6 text-left text-xs">
        <div className="flex flex-row place-content-between">
          <p className="">Copyright © 2024 Nottinghamshire Golf Alliance</p>
          <a href="/#/admin">Admin</a>
        </div>
        <div>
          <a
            href={"https://kainebinch.dev"}
            target="_blank"
            rel="noreferrer"
            className="pt-5 text-xs "
          >
            Web Design by Kaine Binch
          </a>
        </div>
      </div>
    </>
  );
};
export default MobFoot;
