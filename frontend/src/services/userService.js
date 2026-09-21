import api from "./api";


export const getMyProfile = async () => {

  const response = await api.get(
    "/api/users/me"
  );

  return response.data;

};


// =====================================================
// UPLOAD PROFILE PHOTO
// =====================================================

export const uploadProfilePhoto = async (
  file
) => {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response = await api.post(
    "/api/users/upload-photo",
    formData
  );

  return response.data;

};