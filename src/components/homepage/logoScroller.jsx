import ScrollingImages from "../scrollingImages";
import coxmoorLogo from "../../assets/courses/logos/coxmoorLogo.png";
import bondhayLogo from "../../assets/courses/logos/bondhayLogo.png";
import worksopLogo from "../../assets/courses/logos/worksopLogo.png";
import newarkLogo from "../../assets/courses/logos/newarkLogo.png";
import radcliffeLogo from "../../assets/courses/logos/radcliffeLogo.png";
import wollatonLogo from "../../assets/courses/logos/wollatonLogo.png";
import brierlyLogo from "../../assets/courses/logos/brierlyLogo.png";
import ramsdaleLogo from "../../assets/courses/logos/ramsdaleLogo.png";
import oakmereLogo from "../../assets/courses/logos/oakmereLogo.png";
import ruddingtonLogo from "../../assets/courses/logos/ruddingtonLogo.png";
import bulwellLogo from "../../assets/courses/logos/bulwellLogo.png";

const LogoScroller = () => {
  const logos = [
    coxmoorLogo,
    bondhayLogo,
    worksopLogo,
    newarkLogo,
    radcliffeLogo,
    wollatonLogo,
    brierlyLogo,
    ramsdaleLogo,
    oakmereLogo,
    ruddingtonLogo,
    bulwellLogo,
  ];

  return (
    <div className="flex flex-col items-center bg-[#214A27]">
      <hr className="border-black w-full" />
      <div className="h-[75px] overflow-hidden flex items-center justify-center w-full mx-auto">
        <ScrollingImages images={logos} velocity={-50} />
      </div>
      <hr className="border-black w-full" />
    </div>
  );
};

export default LogoScroller;
