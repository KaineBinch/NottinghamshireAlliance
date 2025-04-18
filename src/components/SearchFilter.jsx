import { useState, useEffect } from "react"
import "./SearchFilter.css"

const SearchFilter = ({ data, onFilteredDataChange, uniqueClubs }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [clubQuery, setClubQuery] = useState("")

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase())
  }

  const handleClubChange = (event) => {
    const selectedValue = event.target.value
    setClubQuery(selectedValue === "" ? "" : selectedValue.toLowerCase())
  }

  useEffect(() => {
    const results = data.filter((item) => {
      const matchesName =
        item.name?.toLowerCase().includes(searchQuery) ?? false
      const matchesClub =
        (!clubQuery || item.club?.toLowerCase().includes(clubQuery)) ?? false
      return matchesName && matchesClub
    })

    const timeoutId = setTimeout(() => {
      onFilteredDataChange(results)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, clubQuery, data])

  return (
    <div className="filter-container">
      {/* Search by Name */}
      <div className="search-group">
        <input
          type="text"
          placeholder="Search for a name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="input-field"
        />
      </div>

      {/* Dropdown for Club Filter */}
      <div>
        <select
          value={clubQuery}
          onChange={handleClubChange}
          className="select-field">
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
