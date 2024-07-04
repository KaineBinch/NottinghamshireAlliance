import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Socials = ({ link, icon }) => {
  return (
    <>
      <div className="flex w-full text-start items-center text-lg ">
        <div className="flex items-center justify-center">
          <FontAwesomeIcon
            icon={icon}
            className="mr-5 w-[35px] h-[35px] my-2"
          />
          {link}
        </div>
      </div>
    </>
  );
};
export default Socials;
