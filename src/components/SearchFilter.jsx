import { useState, useEffect, useCallback, useMemo } from "react"

const SearchFilter = ({ data, onFilteredDataChange, uniqueClubs }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [clubQuery, setClubQuery] = useState("")

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value.toLowerCase())
  }, [])

  const handleClubChange = useCallback((event) => {
    const selectedValue = event.target.value
    setClubQuery(selectedValue === "" ? "" : selectedValue.toLowerCase())
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesName =
        item.name?.toLowerCase().includes(searchQuery) ?? false
      const matchesClub =
        (!clubQuery || item.club?.toLowerCase().includes(clubQuery)) ?? false
      return matchesName && matchesClub
    })
  }, [searchQuery, clubQuery, data])

  useEffect(() => {
    if (filteredData !== data) {
      onFilteredDataChange(filteredData)
    }
  }, [filteredData, onFilteredDataChange, data])

  return (
    <div className="flex flex-col mb-4 p-4 border border-gray-300">
      {/* Search by Name */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for a name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 w-full placeholder-gray-500 text-base h-12 rounded-none"
        />
      </div>

      {/* Dropdown for Club Filter */}
      <div>
        <select
          value={clubQuery}
          onChange={handleClubChange}
          className="p-2 border border-gray-300 w-full placeholder-gray-500 text-base h-12 rounded-none">
          <option value="">Select a club...</option>
          {uniqueClubs.map((club, index) => (
            <option key={index} value={club.toLowerCase()}>
              {club}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default SearchFilter
