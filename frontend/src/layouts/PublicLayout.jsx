import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div>
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
};

export default PublicLayout;
