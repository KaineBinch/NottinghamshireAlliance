const ExpandedRowDetails = ({ result, isClubView }) => {
  const formatDate = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)

    if (isNaN(date.getTime())) return "Invalid Date"

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
    if (!result || !Array.isArray(result) || result.length === 0) {
      return <div className="p-4 bg-[#FFFFFF]">No club data available.</div>
    }

    const dateScores = result.reduce((acc, player) => {
      if (!player || !player.scores || !Array.isArray(player.scores)) return acc

      player.scores.forEach(({ date, score }) => {
        if (!date || score === undefined || score === null) return

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

    const sortedDates = Object.keys(top4DateScores).sort((a, b) => {
      return new Date(a) - new Date(b)
    })

    if (sortedDates.length === 0) {
      return <div className="p-4 bg-[#FFFFFF]">No date scores available.</div>
    }

    return (
      <div className="bg-[#D9D9D9] p-2">
        <div className="flex flex-wrap justify-center">
          {sortedDates.map((date, index) => {
            const formattedDate = formatDate(date)
            if (!formattedDate) return null

            return (
              <div
                key={index}
                className="flex flex-col w-1/2 sm:w-1/4 md:w-1/6 lg:w-1/12 border border-gray-300 p-1 text-center bg-[#FFFFFF]">
                <div className="font-semibold">{formattedDate}</div>
                <div>{top4DateScores[date]}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  } else {
    if (
      !result ||
      !result.scores ||
      !Array.isArray(result.scores) ||
      result.scores.length === 0
    ) {
      return <div className="p-4 bg-[#FFFFFF]">No scores available.</div>
    }

    const validScores = result.scores.filter(
      (item) =>
        item && item.score !== undefined && item.score !== null && item.date
    )

    if (validScores.length === 0) {
      return <div className="p-4 bg-[#FFFFFF]">No valid scores available.</div>
    }

    const sortedByDate = [...validScores]
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB - dateA
      })
      .slice(0, 15)

    const MAX_HIGHLIGHT_SCORES = 10
    const topScores = [...validScores]
      .map((item) => parseInt(item.score, 10))
      .filter((score) => !isNaN(score))
      .sort((a, b) => b - a)
      .slice(0, MAX_HIGHLIGHT_SCORES)

    const highlightScoresTracker = [...topScores]

    return (
      <div className="bg-[#D9D9D9] p-2">
        <div className="flex flex-wrap justify-center">
          {sortedByDate.map((res, index) => {
            const score = parseInt(res.score, 10)
            if (isNaN(score)) return null

            const formattedDate = formatDate(res.date)
            if (!formattedDate) return null

            const scoreIndex = highlightScoresTracker.indexOf(score)
            const isTopScore = scoreIndex !== -1

            if (isTopScore) {
              highlightScoresTracker.splice(scoreIndex, 1)
            }

            return (
              <div
                key={index}
                className={`flex flex-col w-1/2 sm:w-1/4 md:w-1/6 lg:w-1/10 border border-gray-300 p-1 text-center ${
                  isTopScore ? "bg-[#214A27] text-white" : "bg-white"
                }`}>
                <div className="font-semibold">{formattedDate}</div>
                <div>{score}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default ExpandedRowDetails
