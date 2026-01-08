import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const authApi = {
  login: (username, password) => {
    return axios.post(`${API_URL}/login`, {
      username,
      password,
    });
  },
};

export default authApi;
