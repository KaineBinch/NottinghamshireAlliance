import { useState } from "react";

const TableButtons = ({ onCategoryChange }) => {
  const [activeButton, setActiveButton] = useState("Amateur");

  const handleButtonClick = (category) => {
    setActiveButton(category);
    onCategoryChange(category);
  };

  const buttonClasses = (category) =>
    `w-1/4 border-r border-gray-400 text-sm md:text-base ${
      activeButton === category
        ? "bg-[#d9d9d9] text-black font-bold h-full border-none"
        : "bg-[#17331B] text-white hover:bg-[#1A4923] active:bg-[#0F2C17] h-full "
    }`;

  return (
    <div className="flex flex-row place-content-evenly items-center h-[50px] text-white bg-[#17331B]">
      <button
        className={buttonClasses("Amateur")}
        onClick={() => handleButtonClick("Amateur")}
      >
        Amateur
      </button>
      <button
        className={buttonClasses("Professional")}
        onClick={() => handleButtonClick("Professional")}
      >
        Professional
      </button>
      <button
        className={buttonClasses("Club")}
        onClick={() => handleButtonClick("Club")}
      >
        Club
      </button>
      <button
        className={buttonClasses("Senior")}
        onClick={() => handleButtonClick("Senior")}
      >
        Senior
      </button>
    </div>
  );
};

export default TableButtons;
