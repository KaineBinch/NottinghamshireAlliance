const ExpandedRowDetails = ({ result, isClubView }) => {
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString("default", { month: "short" })

    let daySuffix = "th"
    if (day === 1 || day === 21 || day === 31) {
      daySuffix = "st"
    } else if (day === 2 || day === 22) {
      daySuffix = "nd"
    } else if (day === 3 || day === 23) {
      daySuffix = "rd"
    }

    return `${day}${daySuffix} ${month}`
  }

  if (isClubView) {
    const dateScores = result.reduce((acc, player) => {
      player.scores.forEach(({ date, score }) => {
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(score)
      })
      return acc
    }, {})

    const top4DateScores = {}
    for (const date in dateScores) {
      dateScores[date].sort((a, b) => b - a)
      const top4Scores = dateScores[date].slice(0, 4)
      top4DateScores[date] = top4Scores.reduce((sum, score) => sum + score, 0)
    }

    const sortedDates = Object.keys(top4DateScores).sort()

    return (
      <div className="bg-[#D9D9D9] p-2">
        <div className="flex flex-wrap justify-center">
          {sortedDates.map((date, index) => (
            <div
              key={index}
              className="flex flex-col w-1/2 sm:w-1/4 md:w-1/6 lg:w-1/12 border border-gray-300 p-1 text-center bg-[#FFFFFF]">
              <div className="font-semibold">{formatDate(date)}</div>{" "}
              {/* Format date */}
              <div>{top4DateScores[date]}</div>
            </div>
          ))}
        </div>
      </div>
    )
  } else {
    if (!result || !result.scores) {
      return <div className="p-4 bg-[#FFFFFF]">No scores available.</div>
    }
    const sortedScores = result.scores
      .map((item) => parseInt(item.score, 10))
      .sort((a, b) => b - a)
      .slice(0, 10)

    const highlightScores = [...sortedScores]

    return (
      <div className="bg-[#D9D9D9] p-2">
        <div className="flex flex-wrap justify-center">
          {result.scores.map((res, index) => {
            const score = parseInt(res.score, 10)
            const isTopScore = highlightScores.includes(score)
            if (isTopScore) {
              highlightScores.splice(highlightScores.indexOf(score), 1)
            }

            return (
              <div
                key={index}
                className={`flex flex-col w-1/2 sm:w-1/4 md:w-1/6 lg:w-1/12 border border-gray-300 p-1 text-center ${
                  isTopScore ? "bg-[#214A27] text-white" : "bg-white"
                }`}>
                <div className="font-semibold">{formatDate(res.date)}</div>{" "}
                {/* Format date */}
                <div>{res.score}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default ExpandedRowDetails
