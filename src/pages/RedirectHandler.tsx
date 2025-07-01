{/*import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/KeycloakProvider";

const RedirectHandler = () => {
  const { roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (roles.includes("project_manager")) {
      navigate("/audit-request", { replace: true });
    } else if (roles.includes("gacam_team")) {
      navigate("/list", { replace: true });
    } else if (roles.includes("admin")) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/not-authorized", { replace: true });
    }
  }, [roles, navigate]);

  return <div className="text-center p-8">Redirection en cours...</div>;
};

export default RedirectHandler;
*/}