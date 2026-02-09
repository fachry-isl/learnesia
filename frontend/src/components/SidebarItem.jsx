const SidebarItem = ({ item_name, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
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
      {/* Icon */}
      <span className={`${isActive ? "text-gray-900" : "text-gray-300"}`}>
        {icon}
      </span>

      {/* Label */}
      <span>{item_name}</span>

      {/* Active Indicator */}
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 bg-gray-900 rounded-full"></span>
      )}
    </button>
  );
};

export default SidebarItem;
