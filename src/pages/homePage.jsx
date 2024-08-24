import Weather from "../components/weather.jsx";
import image from "../assets/background.jpg";
import OOMSection from "../components/homepage/oomSection.jsx";
import CoursesSection from "../components/homepage/coursesSection.jsx";
import FixturesSection from "../components/homepage/fixturesSection.jsx";
import Scroller from "../components/homepage/logoScroller.jsx";

const HomePage = () => {
  return (
    <>
      <div className="flex flex-col w-full">
        <div
          className="mt-[58px] w-full h-[40svh] place-content-end"
          style={{
            backgroundImage: `url(${image})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Weather city="Nottinghamshire" />
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
