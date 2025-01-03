import PageHeader from "../components/pageHeader";
import { MODELS, QUERIES } from "../constants/api";
import useFetch from "../utils/hooks/useFetch";
import { queryBuilder } from "../utils/queryBuilder";

const RulesPage = () => {
  const rulesQuery = queryBuilder(MODELS.rules, QUERIES.rulesQuery);
  const {
    isLoading: isLoadingRules,
    isError: isErrorRules,
    data: rulesData,
    error: errorRules,
  } = useFetch(rulesQuery);

  const conditionsQuery = queryBuilder(
    MODELS.conditions,
    QUERIES.conditionsQuery
  );
  const {
    isLoading: isLoadingConditions,
    isError: isErrorConditions,
    data: conditionsData,
    error: errorConditions,
  } = useFetch(conditionsQuery);

  if (isLoadingRules || isLoadingConditions) {
    return <p className="pt-[85px]">Loading...</p>;
  }

  if (isErrorRules || isErrorConditions) {
    console.error("Error fetching data:", errorRules || errorConditions);
    return (
      <div className="pt-[85px]">
        <p>Something went wrong...</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const renderContent = (contentItem) => {
    if (typeof contentItem === "string") {
      const isIndented = contentItem.trim().startsWith("-");
      return (
        <p key={contentItem} className={`mb-4 ${isIndented ? "ml-6" : ""}`}>
          {contentItem}
        </p>
      );
    }

    if (contentItem.subTitle && Array.isArray(contentItem.text)) {
      return (
        <div key={contentItem.subTitle}>
          <strong>{contentItem.subTitle}</strong>
          {contentItem.text.map((paragraph, idx) => (
            <p key={idx} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderSectionContent = (item) => {
    if (Array.isArray(item.ruleContent)) {
      return item.ruleContent.map((contentItem) => renderContent(contentItem));
    } else if (Array.isArray(item.conditionContent)) {
      return item.conditionContent.map((contentItem) =>
        renderContent(contentItem)
      );
    } else {
      return <p>No content available</p>;
    }
  };

  return (
    <>
      <PageHeader title="Rules" />
      <hr className="border-black" />
      <div className="bg-[#D9D9D9]">
        <div className="max-w-5xl mx-auto text-black py-8 px-4 sm:px-6 lg:px-8 text-start">
          <h1 className="text-3xl mb-2">
            The Nottinghamshire Amateur & Professional Golfers{"'"} Alliance
          </h1>
          <h2 className="mb-8">Founded 1921</h2>
          <h2 className="mb-8">Competition Rules</h2>

          <hr />
          <div className="border-">
            {rulesData?.data && rulesData.data.length > 0 ? (
              rulesData.data.map((item, idx) => (
                <div
                  key={idx}
                  className="collapse collapse-arrow bg-[#fff] drop-shadow mb-1"
                >
                  <input type="checkbox" className="peer" />
                  <div className="collapse-title text-xl font-medium">
                    {item.ruleTitle}
                  </div>
                  <div className="collapse-content">
                    {renderSectionContent(item)}
                  </div>
                </div>
              ))
            ) : (
              <p>No rules available.</p>
            )}

            <h2 className="my-8">Conditions of Competition</h2>

            {conditionsData?.data && conditionsData.data.length > 0 ? (
              conditionsData.data.map((item, idx) => (
                <div
                  key={idx}
                  className="collapse collapse-arrow bg-[#fff] drop-shadow mb-1"
                >
                  <input type="checkbox" className="peer" />
                  <div className="collapse-title text-xl font-medium">
                    {item.conditionTitle || "No Title"}{" "}
                  </div>
                  <div className="collapse-content">
                    {renderSectionContent(item)}
                  </div>
                </div>
              ))
            ) : (
              <p>No conditions available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RulesPage;
