import axios from "axios";

export async function getUptime(playerId, limit = 10, page = 1) {
  return (
    await axios.get(
      `/api/players/${playerId}/uptime?perPage=${limit}&page=${page}`
    )
  ).data;
}
