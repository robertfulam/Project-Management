// import React from 'react'

// const ProtectedRoutes = () => {
//   return (
//     <div>
//       ProtectedRoutes
//     </div>
//   )
// }

// export default ProtectedRoutes


import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {

  const isLoggedIn = false; // replace with auth logic

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoutes;