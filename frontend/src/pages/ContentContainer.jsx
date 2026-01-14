import React from "react";

const ContentContainer = ({ children }) => {
  return (
    <div className="bg-white border border-black flex-1 p-10">{children}</div>
  );
};

export default ContentContainer;
