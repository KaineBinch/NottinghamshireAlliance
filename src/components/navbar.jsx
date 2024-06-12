import { Link, useLocation } from "react-router-dom";
import logo from "../assets/Logo.png";

const Navbar = () => {
  const location = useLocation().pathname;
  const links = [
    { title: "Home", to: "/" },
    { title: "Start Times", to: "/starttimes" },
    { title: "Results", to: "/results" },
    { title: "Courses", to: "/courses" },
    { title: "Fixtures", to: "/fixtures" },
    { title: "Contact", to: "/contact" },
    { title: "Rules", to: "/rules" },
    { title: "Gallery", to: "/gallery" },
  ];
  const loseActiveFocus = () => {
    const elem = document.activeElement;
    if (elem) elem.blur();
  };

  const LinkItem = (title, to, location, my = 1) => {
    const activeClasses = location === to ? "bg-[#17331B]" : "";
    return (
      <li
        key={title}
        onClick={loseActiveFocus}
        className={`${activeClasses} my-${my}`}
        style={{
          marginTop: my,
          marginBottom: my,
        }}
      >
        <Link to={to} className="text-center font-normal text-white inline">
          {title}
        </Link>
      </li>
    );
  };

  return (
    <>
      <div className="w-screen fixed flex bg-[#214A27] justify-center h-[60px] z-10">
        <div className="flex navbar max-w-7xl h-[50px] place-content-between">
          <div className="dropdown visible lg:invisible justify-start items-start lg:w-0 w-auto z-20">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-square text-white justify-center items-center "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="2 2 19 19"
                className="inline-block w-7 h-7 stroke-current"
              >
                <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
            <div className="flex flex-row">
              <ul
                tabIndex={0}
                className="menu absolute left-0 dropdown-content shadow bg-[#214A27] w-[175px] items-start text-lg"
              >
                {links.map(({ title, to }) => LinkItem(title, to, location, 5))}
              </ul>
            </div>
          </div>
          <div className="lg:invisible visible absolute w-full left-0 flex items-center justify-center text-white text-lg">
            Nottinghamshire Golf Alliance
          </div>
          <div className="h-full hidden lg:inline-block flex grow">
            <ul className="h-full flex menu menu-horizontal invisible lg:visible place-content-evenly">
              {links.map(({ title, to }) => LinkItem(title, to, location))}
            </ul>
          </div>
        </div>
        <div className="flex w-full md:w-0 justify-end ml-10">
          <div className="flex items-center justify-center text-sm font-normal text-white pr-5">
            <img src={logo} className="max-h-[50px] max-w-[50px]"></img>
          </div>
        </div>
      </div>
    </>
  );
};
export default Navbar;
