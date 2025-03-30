// Example of how to update RulesPage.jsx
import { useState } from "react"
import PageHeader from "../components/pageHeader"
import { MODELS, QUERIES } from "../constants/api"
import useFetch from "../utils/hooks/useFetch"
import { queryBuilder } from "../utils/queryBuilder"
import { RulesPageSkeleton } from "../components/skeletons"
import "./rulesPage.css"

const RulesPage = () => {
  const rulesQuery = queryBuilder(MODELS.rules, QUERIES.rulesQuery)
  const {
    isLoading: isLoadingRules,
    isError: isErrorRules,
    data: rulesData,
    error: errorRules,
  } = useFetch(rulesQuery)

  const conditionsQuery = queryBuilder(
    MODELS.conditions,
    QUERIES.conditionsQuery
  )
  const {
    isLoading: isLoadingConditions,
    isError: isErrorConditions,
    data: conditionsData,
    error: errorConditions,
  } = useFetch(conditionsQuery)

  const [activeSection, setActiveSection] = useState({
    type: null,
    index: null,
  })

  const [visibleSections, setVisibleSections] = useState({
    rules: {},
    conditions: {},
  })

  if (isLoadingRules || isLoadingConditions) {
    return <RulesPageSkeleton />
  }

  if (isErrorRules || isErrorConditions) {
    console.error("Error fetching data:", errorRules || errorConditions)
    return (
      <div className="error-container">
        <p>Something went wrong...</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  const renderContent = (contentItem) => {
    if (typeof contentItem === "string") {
      const isIndented = contentItem.trim().startsWith("-")
      return (
        <p
          key={contentItem}
          className={`paragraph-spacing ${
            isIndented ? "indented-paragraph" : ""
          }`}>
          {contentItem}
        </p>
      )
    }

    if (contentItem.subTitle && Array.isArray(contentItem.text)) {
      return (
        <div key={contentItem.subTitle}>
          <strong>{contentItem.subTitle}</strong>
          {contentItem.text.map((paragraph, idx) => (
            <p key={idx} className="paragraph-spacing">
              {paragraph}
            </p>
          ))}
        </div>
      )
    }

    return null
  }

  const renderSectionContent = (item) => {
    if (Array.isArray(item.ruleContent)) {
      return item.ruleContent.map((contentItem) => renderContent(contentItem))
    } else if (Array.isArray(item.conditionContent)) {
      return item.conditionContent.map((contentItem) =>
        renderContent(contentItem)
      )
    } else {
      return <p>No content available</p>
    }
  }

  const isSectionOpen = (type, index) => {
    return activeSection.type === type && activeSection.index === index
  }

  const toggleSection = (type, index) => {
    const isCurrentlyActive = isSectionOpen(type, index)

    if (isCurrentlyActive) {
      setActiveSection({ type: null, index: null })
      setTimeout(() => {
        setVisibleSections((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            [index]: false,
          },
        }))
      }, 300)
    } else {
      if (activeSection.type) {
        setTimeout(() => {
          setVisibleSections((prev) => ({
            ...prev,
            [activeSection.type]: {
              ...prev[activeSection.type],
              [activeSection.index]: false,
            },
          }))
        }, 300)
      }

      setActiveSection({ type, index })

      setVisibleSections((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [index]: true,
        },
      }))
    }
  }

  return (
    <>
      <PageHeader title="Rules" />
      <hr className="page-divider" />
      <div className="page-background">
        <div className="content-container">
          <h1 className="page-title">
            The Nottinghamshire Amateur & Professional Golfers{"'"} Alliance
          </h1>
          <h2 className="page-subtitle">Founded 1921</h2>
          <h2 className="page-subtitle">Competition Rules</h2>

          <hr />
          <div>
            {rulesData?.data && rulesData.data.length > 0 ? (
              rulesData.data.map((item, idx) => (
                <div key={idx} className="collapse-item">
                  <input
                    type="checkbox"
                    name={`rules-accordion-${idx}`}
                    checked={isSectionOpen("rules", idx)}
                    onChange={() => toggleSection("rules", idx)}
                  />
                  <div className="collapse-title text-xl font-medium">
                    {item.ruleTitle}
                  </div>
                  {(visibleSections.rules[idx] ||
                    isSectionOpen("rules", idx)) && (
                    <div
                      className={`collapse-content ${
                        isSectionOpen("rules", idx)
                          ? "animate-fade-in-down"
                          : "animate-fade-out-up"
                      }`}
                      key={`rules-content-${idx}`}>
                      {renderSectionContent(item)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No rules available.</p>
            )}

            <h2 className="rules-section-header">Conditions of Competition</h2>

            {conditionsData?.data && conditionsData.data.length > 0 ? (
              conditionsData.data.map((item, idx) => (
                <div key={idx} className="collapse-item">
                  <input
                    type="checkbox"
                    name={`conditions-accordion-${idx}`}
                    checked={isSectionOpen("conditions", idx)}
                    onChange={() => toggleSection("conditions", idx)}
                  />
                  <div className="collapse-title text-xl font-medium">
                    {item.conditionTitle || "No Title"}{" "}
                  </div>
                  {(visibleSections.conditions[idx] ||
                    isSectionOpen("conditions", idx)) && (
                    <div
                      className={`collapse-content ${
                        isSectionOpen("conditions", idx)
                          ? "animate-fade-in-down"
                          : "animate-fade-out-up"
                      }`}
                      key={`conditions-content-${idx}`}>
                      {renderSectionContent(item)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No conditions available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default RulesPage
