import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { jwtDecode } from "jwt-decode";


function AdminProtectedRoute() {

  const token =
    localStorage.getItem("access_token");


  if (!token) {

    return (
      <Navigate
        to="/edutech/login"
        replace
      />
    );

  }


  try {

    const decodedToken =
      jwtDecode(token);

    const role =
      decodedToken.role;


    if (
      role !== "ADMIN" &&
      role !== "SUPER_ADMIN"
    ) {

      localStorage.removeItem(
        "access_token"
      );

      return (
        <Navigate
          to="/edutech/login"
          replace
        />
      );

    }


    return <Outlet />;


  } catch {

    localStorage.removeItem(
      "access_token"
    );

    return (
      <Navigate
        to="/edutech/login"
        replace
      />
    );

  }

}


export default AdminProtectedRoute;