const Header = ({ children }) => {
    return (
      <header className="bg-white px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">{children}</div>
      </header>
    );
  };

export default Header;  