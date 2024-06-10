import image from "../assets/homeTopImage.jpg";
import Navbar from "../components/nav/navbar";
import logo from "../assets/Logo.png";
import FixtureCard from "../components/fixtureCard.jsx";
import { clubs } from "../constants/golfClubs";
import MobFoot from "../components/mobileFooter.jsx";

const HomePage = () => {
  return (
    <>
      <div className="flex flex-col w-screen">
        <div
          className="place-items-center top-0 h-[65svh] w-full "
          style={{
            backgroundImage: `url(${image})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex place-content-center h-[50px] w-auto z-10 bg-[#222222] bg-opacity-50 backdrop-blur-[2.75px] drop-shadow-2xl">
            <div className="flex text-white items-center justify-center">
              WEATHER ICONS
            </div>
          </div>
          <Navbar />
          <div className="flex justify-center h-[40svh] items-end">
            <img src={logo} className="max-w-[100px] max-h-[100px]" />
          </div>
        </div>
        <div>
          <div className="text-start bg-[#D9D9D9] ">
            <div className="text-start">
              <div className="max-w-md text-black pl-5 pr-24 py-[25px]">
                <h1 className="text-4xl font-semibold">
                  Welcome to the Nottinghamshire Golf Alliance
                </h1>
                <p className="py-6">
                  Experience the best golf courses in Nottinghamshire and
                  compete with amateurs and professionals in our exciting
                  competitions.
                </p>

                <a
                  className="btn rounded-none w-[125px] border-black"
                  href="/#/starttimes"
                >
                  Start Times
                </a>
                <a
                  className="btn rounded-none ml-3 w-[125px] border-black text-white bg-[#214A27]"
                  href="/#/results"
                >
                  Results
                </a>
              </div>
            </div>
          </div>
          <hr className="border-black" />
          <div className="text-start mx-5 py-[25px] text-black">
            <h1 className="text-4xl font-semibold ">Fixtures</h1>
            <div className="flex items-center">
              <p className="py-6">
                All the latest information about upcoming fixtures
              </p>
              <a
                className="btn rounded-none ml-3 w-[125px] border-black text-white bg-[#214A27]"
                href="/#/fixtures"
              >
                Fixtures
              </a>
            </div>
            {clubs
              .filter((club, index) => index < 3)
              .map((club, i) => (
                <FixtureCard
                  className=""
                  key={i}
                  name={club.name}
                  address={club.address}
                  courseImage={club.courseImage}
                  comp={club.comp}
                  dayName={club.dayName}
                  day={club.day}
                  month={club.month}
                  year={club.year}
                />
              ))}
          </div>
          <hr className="border-black" />
          <div className="bg-[#D9D9D9]">
            <div className="text-start mx-5 py-[25px] text-black">
              <h1 className="text-4xl font-semibold ">Courses</h1>
              <div className="flex items-center">
                <p className="py-6">
                  Explore the courses within our alliance by clicking here.
                </p>
                <a
                  className="btn rounded-none ml-3 w-[125px] border-black text-black bg-white"
                  href="/#/courses"
                >
                  Courses
                </a>
              </div>
            </div>
          </div>
          <hr className="border-black" />
          <div>
            <div className="flex items-center text-start mx-5 py-[25px] text-black">
              <h1 className="text-4xl font-semibold ">
                Order Of Merit Standings
              </h1>
              <div className="">
                <a
                  className="btn rounded-none w-[125px] border-black text-white bg-[#214A27]"
                  href="/#/results"
                >
                  Results
                </a>
              </div>
            </div>
          </div>
          <hr className="border-black" />
          <MobFoot />
        </div>
      </div>
    </>
  );
};
export default HomePage;
