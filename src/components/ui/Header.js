import { Menu } from 'lucide-react';

const Header = ({ children, onToggleSidebar }) => {
    return (
      <header className="bg-white px-4 py-3 md:px-8 md:py-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          )}
          {children}
        </div>
      </header>
    );
  };

export default Header;
