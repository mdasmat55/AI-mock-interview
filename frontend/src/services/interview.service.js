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

export const submitAnswer = async (interviewId, questionIndex, answer) => {
  const response = await api.post(
    `/interviews/${interviewId}/answer`,
    {
      questionIndex,
      answer,
    }
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

export const getInterviewById = async (interviewId) => {
  const response = await api.get(
    `/interviews/${interviewId}`
  );

  return response.data;
};