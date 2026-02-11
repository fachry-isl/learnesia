import { NavLink } from "react-router-dom";

const SidebarItem = ({ item_name, icon, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        w-full flex items-center gap-3 px-4 py-3 rounded-lg
        transition-all duration-200 ease-in-out
        text-left font-medium text-sm
        ${
          isActive
            ? "bg-white text-gray-900 shadow-md"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }
      `}
    >
      <span className="shrink-0">{icon}</span>
      <span>{item_name}</span>
    </NavLink>
  );
};

export default SidebarItem;
