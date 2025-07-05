import "./pageHeader.css"

const PageHeader = ({ title }) => {
  return (
    <>
      <div className="header-container">
        <div className="header-content">
          <h1 className="header-title">{title}</h1>
        </div>
      </div>
    </>
  )
}

export default PageHeader
