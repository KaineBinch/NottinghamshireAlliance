import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Socials = ({ link, icon }) => {
  return (
    <>
      <div className="flex w-full text-start items-center text-base ">
        <a
          className="flex items-center justify-center"
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          <FontAwesomeIcon
            icon={icon}
            className="mr-5 w-[35px] h-[35px] my-2"
          />
          {link}
        </a>
      </div>
    </>
  );
};
export default Socials;
