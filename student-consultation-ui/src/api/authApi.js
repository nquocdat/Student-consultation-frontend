import axios from "axios";

const API_URL = "https://student-consultation-nqd.onrender.com/api/auth";

const authApi = {
  login: (username, password) => {
    return axios.post(`${API_URL}/login`, {
      username,
      password,
    });
  },
};

export default authApi;
