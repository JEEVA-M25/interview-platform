function Header({ user, onLogout }) {
  return (
    <header className="app-header">
      <a className="brand" href="#top" aria-label="CareerVerse AI home">
        <span className="brand-mark">CV</span>
        <span>
          <strong>CareerVerse AI</strong>
          <small>{user ? `${user.role.toLowerCase()} workspace` : 'interview readiness platform'}</small>
        </span>
      </a>

      {user ? (
        <div className="session-actions">
          <span>{user.fullName}</span>
          <button type="button" onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#student-login">Student Login</a>
          <a href="#admin-login">Admin Login</a>
        </nav>
      )}
    </header>
  )
}

export default Header
