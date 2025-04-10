import { useState, useEffect } from "react"
import "./SearchFilter.css"

const SearchFilter = ({ data, onFilteredDataChange, uniqueClubs }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [clubQuery, setClubQuery] = useState("")

  // Handle input changes
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase())
  }

  const handleClubChange = (event) => {
    const selectedValue = event.target.value
    setClubQuery(selectedValue === "" ? "" : selectedValue.toLowerCase())
  }

  // Run filtering ONLY when search terms or data changes
  useEffect(() => {
    // Filter data based on search criteria
    const results = data.filter((item) => {
      const matchesName =
        item.name?.toLowerCase().includes(searchQuery) ?? false
      const matchesClub =
        (!clubQuery || item.club?.toLowerCase().includes(clubQuery)) ?? false
      return matchesName && matchesClub
    })

    // Call the parent callback with filtered results
    // This runs AFTER render, preventing the infinite loop
    const timeoutId = setTimeout(() => {
      onFilteredDataChange(results)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, clubQuery, data]) // Intentionally exclude onFilteredDataChange

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
