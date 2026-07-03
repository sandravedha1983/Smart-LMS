import api from '../api/axios';

export const getPuzzles = async ({ daily = false } = {}) => {
  const query = daily ? '?daily=true' : '';
  const response = await api.get(`/puzzles/${query}`);
  return response.data;
};

export const submitPuzzleAnswer = async ({ puzzleId, answer, correct, solve_time_seconds, hints_used, attempts_count }) => {
  const response = await api.post(`/puzzles/${puzzleId}/solve/`, {
    answer,
    correct,
    solve_time_seconds,
    hints_used,
    attempts_count
  });
  return response.data;
};
