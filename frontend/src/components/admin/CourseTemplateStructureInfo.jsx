import React from "react";

const CourseTemplateStructureInfo = ({ attribute, value }) => {
  return (
    <div className="bg-gray-50 rounded p-2">
      <div className="text-xs text-gray-500">{attribute}</div>
      <div className="text-base font-bold text-gray-900">{value}</div>
    </div>
  );
};

export default CourseTemplateStructureInfo;
