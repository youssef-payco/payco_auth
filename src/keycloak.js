import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: process.env.REACT_APP_KEYCLOAK_URL || "https://payco-keycloak-gke0hzgqd4dhcbg5.westus2-01.azurewebsites.net",
  realm: process.env.REACT_APP_KEYCLOAK_REALM || "payco-realm",
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || "payco-app",
});

export default keycloak;
