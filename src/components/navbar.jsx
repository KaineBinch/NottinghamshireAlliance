import { Link, useLocation } from "react-router-dom"
import logo from "../assets/Logo.png"
import "./navbar.css"

const Navbar = () => {
  const location = useLocation().pathname
  const links = [
    { title: "Home", to: "/" },
    { title: "Tee Times", to: "/teetimes" },
    { title: "Results", to: "/results" },
    { title: "Fixtures", to: "/fixtures" },
    { title: "Courses", to: "/courses" },
    { title: "Order Of Merit", to: "/oom" },
    { title: "Gallery", to: "/gallery" },
  ]
  const loseActiveFocus = () => {
    const elem = document.activeElement
    if (elem) elem.blur()
  }

  const LinkItem = (title, to, location, my = 1) => {
    const activeClass = location === to ? "link-active" : ""
    return (
      <li
        key={title}
        onClick={loseActiveFocus}
        className={`${activeClass}`}
        style={{
          marginTop: my,
          marginBottom: my,
        }}>
        <Link to={to} className="nav-link">
          {title}
        </Link>
      </li>
    )
  }

  return (
    <>
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="mobile-menu dropdown">
            <label tabIndex={0} className="menu-button btn btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="2 2 19 19"
                className="menu-icon">
                <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
            <div className="dropdown-container">
              <ul tabIndex={0} className="dropdown-menu menu dropdown-content">
                {links.map(({ title, to }) => (
                  <div key={title} className="dropdown-item-container">
                    {LinkItem(title, to, location, 5)}
                  </div>
                ))}
              </ul>
            </div>
          </div>
          <div className="mobile-title">
            <a href={"/"}>Nottinghamshire Golf Alliance</a>
          </div>
          <div className="desktop-menu-container">
            <ul className="desktop-menu">
              {links.map(({ title, to }) => LinkItem(title, to, location))}
            </ul>
          </div>
          <div className="logo-container">
            <img src={logo} className="logo" alt="Logo" />
          </div>
        </div>
      </div>
    </>
  )
}
export default Navbar
