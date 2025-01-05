const ExpandedRowDetails = ({ result, isClubView }) => {
  if (isClubView) {
    // Club view logic
    const dateScores = result.reduce((acc, { date, score }) => {
      const scoreValue = parseInt(score, 10);
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += scoreValue;
      return acc;
    }, {});

    const sortedDates = Object.keys(dateScores).sort();

    return (
      <div className="bg-[#D9D9D9] p-2">
        <div className="flex flex-wrap justify-center">
          {sortedDates.map((date, index) => (
            <div
              key={index}
              className="flex flex-col w-1/2 sm:w-1/4 md:w-1/6 lg:w-1/12 border border-gray-300 p-1 text-center bg-white"
            >
              <div className="font-semibold">{date}</div>
              <div>{dateScores[date]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    // Player view logic
    const sortedScores = result
      .map((item) => parseInt(item.score, 10))
      .sort((a, b) => b - a)
      .slice(0, 10);

    const highlightScores = [...sortedScores];

    return (
      <div className="bg-[#ffffff] p-2">
        <div className="flex flex-wrap justify-center">
          {result.map((res, index) => {
            const score = parseInt(res.score, 10);
            const isTopScore = highlightScores.includes(score);
            if (isTopScore) {
              highlightScores.splice(highlightScores.indexOf(score), 1);
            }

            return (
              <div
                key={index}
                className={`flex flex-col w-1/2 sm:w-1/4 md:w-1/6 lg:w-1/12 border border-gray-400 p-1 text-center ${
                  isTopScore ? "bg-[#214A27] text-white" : "bg-white"
                }`}
              >
                <div className="font-semibold">{res.date}</div>
                <div>{res.score}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};

export default ExpandedRowDetails;
