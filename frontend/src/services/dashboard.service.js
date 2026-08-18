import api from "./api";

export const getMyInterviews = async () => {
  const response = await api.get("/interviews/my-interviews");

  return response.data;
};
