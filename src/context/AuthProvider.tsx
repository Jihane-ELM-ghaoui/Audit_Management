// src/context/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import keycloak from "../keycloak";

type AuthContextType = {
  keycloak: typeof keycloak;
  initialized: boolean;
  authenticated: boolean;
  roles: string[];
};

const AuthContext = createContext<AuthContextType>({
  keycloak,
  initialized: false,
  authenticated: false,
  roles: [],
});

export const useAuth = () => useContext(AuthContext);

// Variable globale pour éviter double init
let keycloakHasBeenInitialized = false;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const initializeKeycloak = async () => {
      if (!keycloakHasBeenInitialized) {
        keycloakHasBeenInitialized = true;
        try {
          const auth = await keycloak.init({ 
            onLoad: "check-sso", 
            checkLoginIframe: false,
            pkceMethod: "S256", // Recommended if using Authorization Code Flow
          });

          setAuthenticated(auth);
          setInitialized(true);

          if (auth && keycloak.realmAccess) {
            setRoles(keycloak.realmAccess.roles || []);
          }

          // 🔁 Refresh token loop every 60 seconds
          setInterval(async () => {
            try {
              const refreshed = await keycloak.updateToken(60); // refresh if token will expire in 60s
              if (refreshed) {
                console.log("🔁 Token was successfully refreshed");
              } else {
                console.log("✅ Token is still valid");
              }
            } catch (error) {
              console.error("❌ Failed to refresh token", error);
              keycloak.logout(); // logout if refresh failed
            }
          }, 60000); // every 60s
        } catch (err) {
          console.error("❌ Keycloak init failed", err);
        }
      }
    };

    initializeKeycloak();
  }, []);


  if (!initialized) return <div className="text-center mt-20">Loading authentication...</div>;

  return (
    <AuthContext.Provider value={{ keycloak, initialized, authenticated, roles }}>
      {children}
    </AuthContext.Provider>
  );
};
