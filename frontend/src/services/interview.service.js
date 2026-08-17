import api from "./api";

export const createInterview = async (data) => {
  const response = await api.post("/interviews/create", data);

  return response.data;
};

export const startInterview = async (interviewId) => {
  const response = await api.post(
    `/interviews/${interviewId}/start`
  );

  return response.data;
};

export const submitAnswer = async (interviewId, answer) => {
  const response = await api.post(
    `/interviews/${interviewId}/answer`,
    { answer }
  );

  return response.data;
};

export const completeInterview = async (interviewId) => {
  const response = await api.post(
    `/interviews/${interviewId}/complete`
  );

  return response.data;
};

export const generateReport = async (interviewId) => {
  const response = await api.post(
    `/reports/${interviewId}`
  );

  return response.data;
};