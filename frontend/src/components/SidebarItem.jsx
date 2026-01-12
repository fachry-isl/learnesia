import React from "react";

const SidebarItem = ({ item_name, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`border border-white p-2 mb-5 ${
        isActive ? "bg-gray-50 text-black font-semibold" : "cursor-pointer"
      }`}
    >
      {item_name}
    </div>
  );
};
export default SidebarItem;
