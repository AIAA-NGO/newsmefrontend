export const setAuthData = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userRoles", JSON.stringify(data.roles));
    localStorage.setItem("userName", data.username);
    localStorage.setItem("userId", data.userId);
  };
  
  export const getAuthData = () => {
    return {
      token: localStorage.getItem("token"),
      roles: JSON.parse(localStorage.getItem("userRoles") || "[]"),
      username: localStorage.getItem("userName"),
      userId: localStorage.getItem("userId")
    };
  };
  
  export const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRoles");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
  };
  
  export const hasRole = (requiredRole) => {
    const roles = JSON.parse(localStorage.getItem("userRoles") || "[]");
    return roles.includes(requiredRole);
  };
  
  export const hasAnyRole = (requiredRoles) => {
    const userRoles = JSON.parse(localStorage.getItem("userRoles") || "[]");
    return requiredRoles.some(role => userRoles.includes(role));
  };
  
  export const getPrimaryRole = () => {
    const roles = JSON.parse(localStorage.getItem("userRoles") || "[]");
    if (roles.includes("ADMIN")) return "ADMIN";
    if (roles.includes("MANAGER")) return "MANAGER";
    return roles[0] || "USER";
  };
  
  export const isAdmin = () => hasRole("ADMIN");