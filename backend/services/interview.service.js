export const getInterviewById = async (interviewId) => {
  const response = await api.get(`/interviews/${interviewId}`);

  return response.data;
};
