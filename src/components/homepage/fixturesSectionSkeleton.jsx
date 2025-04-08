import HomePageHeader from "./homepageHeader"
import FixtureCardSkeleton from "../fixtures/fixtureCardSkeleton"

const FixturesSectionSkeleton = () => {
  return (
    <div className="">
      <HomePageHeader
        title="Fixtures"
        subtext="Stay updated with the latest details on upcoming fixtures. Click here for more information."
        btnName="Fixtures"
        btnStyle="text-white bg-[#214A27]"
        page="fixtures"
      />
      <div className="flex flex-col items-center mb-10 px-5">
        <h2 className="text-2xl font-bold text-black mb-4">Next Fixture</h2>

        <div className="w-auto max-w-5xl mb-10">
          <FixtureCardSkeleton />
        </div>

        <h3 className="text-xl font-semibold text-black mb-6">
          Upcoming Fixtures
        </h3>

        <div className="w-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <FixtureCardSkeleton />
          <FixtureCardSkeleton />
        </div>
      </div>
    </div>
  )
}

export default FixturesSectionSkeleton
