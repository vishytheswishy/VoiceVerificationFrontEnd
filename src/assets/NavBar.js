export const NavBar = (user, signOut) => {
  return (
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="/">
            <img
              src={require("../images/identify_logo.png")}
              width="100%"
              height="103"
              alt="logo for amazon identify"
            />
          </a>
          <a
            href="/"
            role="button"
            className="navbar-burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-start">
            <a className="navbar-item" href="/">
              Amazon Identify Voice Verification on AWS
            </a>
            <a className="navbar-item" href="/registration">
              Registration
            </a>
            <a className="navbar-item" href="/verification">
              Verification
            </a>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <a className="button " href="/profile">
                  <strong>Welcome {user.user.attributes.email}!</strong>
                </a>
                <a className="button is-danger" onClick={signOut}>
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
  );
};
export default NavBar;
