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
            ? "bg-black text-white shadow-md"
            : "text-black-300 hover:bg-gray-200 hover:text-black"
        }
      `}
    >
      <span className="shrink-0">{icon}</span>
      <span>{item_name}</span>
    </NavLink>
  );
};

export default SidebarItem;
