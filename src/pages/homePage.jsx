import image from "../assets/homepageHole.jpg";
import logo from "../assets/Logo.png";
import OOMSection from "../components/homepage/oomSection.jsx";
import CoursesSection from "../components/homepage/coursesSection.jsx";
import FixturesSection from "../components/homepage/fixturesSection.jsx";
import Scroller from "../components/homepage/logoScroller.jsx";

const HomePage = () => {
  return (
    <>
      <div className="flex flex-col w-full">
        <div
          className="mt-[58px] w-full "
          style={{
            backgroundImage: `url(${image})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex justify-center h-[40svh] items-end pb-5">
            <img src={logo} className="max-w-[100px] max-h-[100px]" />
          </div>
          <div className="flex place-content-center h-[50px] w-auto z-10 bg-[#222222] bg-opacity-50 backdrop-blur-[2.75px] drop-shadow-2xl">
            <div className="flex text-white items-center justify-center">
              ***WEATHER ICONS***
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="bg-[#D9D9D9] flex place-content-center">
            <div className="text-center text-black px-5 py-[50px] max-w-5xl">
              <h1>Welcome to the Nottinghamshire Golf Alliance</h1>
              <p className="py-[25px]">
                Experience the best golf courses in Nottinghamshire and compete
                with amateurs and professionals in our exciting competitions.
                The Nottinghamshire Amateur & Professional Golfer{"'"}s Alliance
                brings golfers of all levels together for skill development and
                friendly competition. Enjoy regular tournaments and a welcoming
                atmosphere that fosters connections within the golfing
                community.
              </p>
              <a
                className="btn rounded-none mr-8 w-[125px] border-black"
                href="/#/starttimes"
              >
                Start Times
              </a>
              <a
                className="btn rounded-none ml-8 w-[125px] border-black text-white bg-[#214A27]"
                href="/#/results"
              >
                Results
              </a>
            </div>
          </div>
          <hr className="border-black" />
          <FixturesSection />
          <hr className="border-black" />
          <CoursesSection />
          <hr className="border-black" />
          <OOMSection />
          <Scroller />
        </div>
      </div>
    </>
  );
};
export default HomePage;
