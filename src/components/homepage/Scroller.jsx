import { clubLogos } from "../../constants/clubLogos";
import ScrollingImages from "./scrollingImages";

const LogoScroller = () => {
  return (
    <div className="flex flex-col items-center bg-[#214A27]">
      <hr className="border-black w-full" />
      <div className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto">
        <ScrollingImages images={clubLogos} velocity={-50} />
      </div>
      <hr className="border-black w-full" />
    </div>
  );
};

export default LogoScroller;
