import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
            <span className="font-bold">Telephone: </span>07734 924 889
            <br />
            <span className="font-bold">Email: </span>
            drivewithglenn@hotmail.co.uk
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center pb-3"></div>
        {/* Footer Links */}
        <div className="text-center text-sm font-normal pb-14">
          <div className="flex flex-col">
            <div className="flex flex-row items-center justify-center pb-8">
              <a className="mr-6 w-[125px]">About Us</a>
              <a className="ml-6 w-[125px]">Email Us</a>
            </div>
            <div className="flex flex-row items-center justify-center pb-8">
              <a className="mr-6 w-[125px]">Rules</a>
              <a className="ml-6 w-[125px]">Call Us</a>
            </div>
            <div className="flex flex-row items-center justify-center">
              <a className="mr-6 w-[125px]">Directors</a>
              <a className="ml-6 w-[125px]">Gallery</a>
            </div>
          </div>
        </div>
        {/* Socials */}
        <div className="flex justify-center space-x-6 pb-8">
          <a href="#" className="">
            <span className="sr-only ">Facebook</span>
            <FontAwesomeIcon
              className="w-6 h-6"
              icon="fa-brands fa-square-facebook"
            />
          </a>
          <a href="#" className="">
            <span className="sr-only">Instagram</span>
            <FontAwesomeIcon
              className="w-6 h-6"
              icon="fa-brands fa-square-instagram"
            />
          </a>
          <a href="#" className="">
            <span className="sr-only">Phone</span>
            <FontAwesomeIcon className="w-6 h-6" icon="fa-solid fa-phone" />
          </a>
          <a href="#" className="">
            <span className="sr-only">Email</span>
            <FontAwesomeIcon className="w-6 h-6" icon="fa-solid fa-envelope" />
          </a>
        </div>
      </div>
      <hr className="border-1 border-neutral mt-8" />
      <p className="flex flex-col py-8 leading-6 text-center text-xs">
        Copyright © 2024 Express Tool Hire Ltd
        <a
          href={"https://kainebinch.dev"}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost pt-4 text-xs"
        >
          Web Design
        </a>
      </p>
    </>
  );
};
export default MobFoot;
