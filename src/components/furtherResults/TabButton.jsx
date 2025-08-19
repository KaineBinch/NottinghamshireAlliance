const TabButton = ({ id, label, icon: Icon, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`tab-button ${
      activeTab === id ? "tab-button-active" : "tab-button-inactive"
    }`}>
    <Icon className="tab-icon" size={20} />
    {label}
  </button>
)

export default TabButton
