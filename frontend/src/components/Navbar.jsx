import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavigate("/dashboard")}
          className="text-xl font-bold"
        >
          AI Interview
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleNavigate("/dashboard")}
            className="text-gray-600 hover:text-black"
          >
            Dashboard
          </button>

          <button
            onClick={() => handleNavigate("/profile")}
            className="text-gray-600 hover:text-black"
          >
            Profile
          </button>

          <span className="text-gray-400">{user?.name}</span>

          <button
            onClick={handleLogout}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden text-2xl"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t px-6 py-4">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleNavigate("/dashboard")}
              className="text-left text-gray-600 hover:text-black"
            >
              Dashboard
            </button>

            <button
              onClick={() => handleNavigate("/profile")}
              className="text-left text-gray-600 hover:text-black"
            >
              Profile
            </button>

            <div className="text-gray-400 border-t pt-4">{user?.name}</div>

            <button onClick={handleLogout} className="text-left text-red-500">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
