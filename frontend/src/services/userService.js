import api from "./api";


export const getMyProfile = async () => {

  const response = await api.get(
    "/api/users/me"
  );

  return response.data;
};