import { useMemo } from "react"

export const useResultsData = (data, eventId, isLoading) => {
  return useMemo(() => {
    if (!data?.data || isLoading) {
      return {
        event: null,
        amateurScores: [],
        professionalScores: [],
        topAmateur: null,
        seniorScores: [],
        topSenior: null,
        sortedTeams: [],
        winningTeam: null,
        secondTeam: null,
        firstIndividual: null,
        secondIndividual: null,
        allAmateurData: { headers: [], rows: [] },
        allTeamData: { headers: [], rows: [] },
        topAmateurData: { headerRow: [], rows: [] },
        uniqueAmateurClubs: [],
        uniqueTeamClubs: [],
      }
    }

    const event = data?.data?.find((e) => e.id.toString() === eventId)

    if (!event) {
      return {
        event: null,
        amateurScores: [],
        professionalScores: [],
        topAmateur: null,
        seniorScores: [],
        topSenior: null,
        sortedTeams: [],
        winningTeam: null,
        secondTeam: null,
        firstIndividual: null,
        secondIndividual: null,
        allAmateurData: { headers: [], rows: [] },
        allTeamData: { headers: [], rows: [] },
        topAmateurData: { headerRow: [], rows: [] },
        uniqueAmateurClubs: [],
        uniqueTeamClubs: [],
      }
    }

    // Filter out scores with null golferEventScore at the beginning
    const validScores = (event.scores || []).filter(
      (score) => score.golferEventScore != null && score.golferEventScore !== ""
    )

    const getOrdinal = (n) => {
      if (n <= 0) return ""
      const s = ["th", "st", "nd", "rd"]
      const v = n % 100
      if (v >= 11 && v <= 13) return "th"
      const lastDigit = n % 10
      return s[lastDigit] || "th"
    }

    const findTiedScores = (scores) => {
      const scoreGroups = {}
      scores.forEach((score) => {
        const eventScore = score.golferEventScore
        if (!scoreGroups[eventScore]) {
          scoreGroups[eventScore] = []
        }
        scoreGroups[eventScore].push(score)
      })
      return Object.values(scoreGroups).filter((group) => group.length > 1)
    }

    const sortScoresWithTiebreaker = (scores) => {
      const tiedGroups = findTiedScores(scores)
      const tiedScoreValues = new Set(
        tiedGroups.map((group) => group[0].golferEventScore)
      )

      return [...scores].sort((a, b) => {
        const scoreA = a.golferEventScore
        const scoreB = b.golferEventScore
        const scoreDiff = scoreB - scoreA

        if (scoreDiff !== 0) return scoreDiff

        if (tiedScoreValues.has(a.golferEventScore)) {
          const back9A = a.back9Score != null ? a.back9Score : -Infinity
          const back9B = b.back9Score != null ? b.back9Score : -Infinity
          return back9B - back9A
        }

        return 0
      })
    }

    const applyTiebreakerFlags = (sortedScores) => {
      const tiedGroups = findTiedScores(sortedScores)

      tiedGroups.forEach((group) => {
        const uniqueBack9Scores = new Set(
          group.map((score) =>
            score.back9Score != null ? score.back9Score : null
          )
        )
        if (uniqueBack9Scores.size <= 1) return

        const sortedGroup = [...group].sort(
          (a, b) =>
            (b.back9Score != null ? b.back9Score : -Infinity) -
            (a.back9Score != null ? a.back9Score : -Infinity)
        )

        sortedGroup.forEach((score) => {
          score.usedTiebreaker = true
        })
      })

      return sortedScores
    }

    const sortedScores = applyTiebreakerFlags(
      sortScoresWithTiebreaker(validScores)
    )

    const amateurScores = sortedScores.filter(
      (score) => score.golfer && !score.golfer.isPro
    )

    const topAmateur = amateurScores.length > 0 ? amateurScores[0] : null

    const professionalScores = sortedScores.filter(
      (score) => score.golfer?.isPro
    )

    const seniorScores = amateurScores.filter(
      (score) => score.golfer && score.golfer.isSenior
    )

    // Group all players (both amateurs and professionals) by club for teams
    const clubScores = {}
    sortedScores.forEach((score) => {
      if (!score.golfer?.golf_club || score.isNIT) return

      const clubName = score.golfer.golf_club.clubName || "Unaffiliated"
      if (!clubScores[clubName]) {
        clubScores[clubName] = []
      }
      clubScores[clubName].push(score)
    })

    const teamScores = Object.entries(clubScores).map(([clubName, scores]) => {
      const sortedClubScores = [...scores].sort(
        (a, b) => b.golferEventScore - a.golferEventScore
      )

      const topScores = sortedClubScores.slice(0, 4)

      const totalPoints = topScores.reduce(
        (sum, score) => sum + score.golferEventScore,
        0
      )

      const totalBack9 = topScores.reduce(
        (sum, score) => sum + (score.back9Score != null ? score.back9Score : 0),
        0
      )

      return {
        clubName,
        scores: topScores,
        totalPoints,
        totalBack9,
      }
    })

    const sortedTeams = [...teamScores].sort((a, b) => {
      const pointsDiff = b.totalPoints - a.totalPoints
      if (pointsDiff !== 0) return pointsDiff
      return b.totalBack9 - a.totalBack9
    })

    const teamPointGroups = {}
    sortedTeams.forEach((team) => {
      if (!teamPointGroups[team.totalPoints]) {
        teamPointGroups[team.totalPoints] = []
      }
      teamPointGroups[team.totalPoints].push(team)
    })

    Object.values(teamPointGroups)
      .filter((group) => group.length > 1)
      .forEach((group) => {
        const uniqueBack9 = new Set(group.map((team) => team.totalBack9))
        if (uniqueBack9.size <= 1) return

        group.forEach((team) => {
          team.usedTiebreaker = true
        })
      })

    const winningTeam = sortedTeams.length > 0 ? sortedTeams[0] : null
    const secondTeam = sortedTeams.length > 1 ? sortedTeams[1] : null

    const playersInWinningTeams = new Set()
    if (winningTeam) {
      winningTeam.scores.forEach((score) => {
        if (score.golfer) playersInWinningTeams.add(score.golfer.golferName)
      })
    }
    if (secondTeam) {
      secondTeam.scores.forEach((score) => {
        if (score.golfer) playersInWinningTeams.add(score.golfer.golferName)
      })
    }

    const eligibleIndividuals = amateurScores.filter(
      (score) =>
        score.golfer &&
        !playersInWinningTeams.has(score.golfer.golferName) &&
        score !== topAmateur
    )

    const firstIndividual =
      eligibleIndividuals.length > 0 ? eligibleIndividuals[0] : null
    const secondIndividual =
      eligibleIndividuals.length > 1 ? eligibleIndividuals[1] : null

    const eligibleSeniors = seniorScores.filter(
      (score) =>
        score.golfer &&
        !playersInWinningTeams.has(score.golfer.golferName) &&
        score !== topAmateur &&
        score !== firstIndividual &&
        score !== secondIndividual
    )

    const topSenior =
      eligibleSeniors.length > 0
        ? [...eligibleSeniors].sort(
            (a, b) => b.golferEventScore - a.golferEventScore
          )[0]
        : null

    const topAmateurData = {
      headerRow: ["Golfer Name", "Club", "Points"],
      rows: topAmateur
        ? [
            [
              topAmateur.golfer?.golferName || "Unknown",
              topAmateur.golfer?.golf_club?.clubName || "Unknown",
              {
                content: topAmateur.golferEventScore.toString(),
                usedTiebreaker: topAmateur.usedTiebreaker,
                back9Score:
                  topAmateur.back9Score != null ? topAmateur.back9Score : "-",
              },
            ],
          ]
        : [["No Amateur Scores", "", ""]],
    }

    const allAmateurData = {
      headers: ["Position", "Golfer Name", "Club", "Points"],
      rows: amateurScores.map((score, index) => [
        `${index + 1}${getOrdinal(index + 1)}`,
        <>
          {score.isNIT && (
            <span className="text-orange-600 mr-1 text-xs font-medium">
              NIT
            </span>
          )}
          {score.golfer?.golferName || "Unknown"}
          {score.golfer?.isSenior && (
            <span className="golfer-senior-tag">Senior</span>
          )}
        </>,
        score.golfer?.golf_club?.clubName || "Unaffiliated",
        {
          content: score.golferEventScore.toString(),
          usedTiebreaker: score.usedTiebreaker,
          back9Score: score.back9Score != null ? score.back9Score : "-",
        },
      ]),
    }

    const allTeamData = {
      headers: ["Position", "Club", "Total Points"],
      rows: sortedTeams.map((team, index) => [
        `${index + 1}${getOrdinal(index + 1)}`,
        team.clubName,
        {
          content: team.totalPoints.toString(),
          usedTiebreaker: team.usedTiebreaker,
          back9Score: team.totalBack9,
        },
      ]),
    }

    const uniqueAmateurClubs = [
      ...new Set(
        amateurScores.map(
          (score) => score.golfer?.golf_club?.clubName || "No Club"
        )
      ),
    ].sort()

    const uniqueTeamClubs = [
      ...new Set(sortedTeams.map((team) => team.clubName || "No Club")),
    ].sort()

    const result = {
      event,
      amateurScores,
      professionalScores,
      topAmateur,
      seniorScores,
      topSenior,
      sortedTeams,
      winningTeam,
      secondTeam,
      firstIndividual,
      secondIndividual,
      allAmateurData,
      allTeamData,
      topAmateurData,
      uniqueAmateurClubs,
      uniqueTeamClubs,
    }

    return result
  }, [data, eventId, isLoading])
}
