import axios from "axios";

export async function getLogs(
  limit = 10,
  page = 1,
  sortBy = null,
  sortMode = null,
  filter = null
) {
  return (
    await axios.get(
      `/api/logs?perPage=${limit}&page=${page}${q("sort_by", sortBy)}${q(
        "sort_mode",
        sortMode
      )}${q("filter", filter)}`
    )
  ).data;
}

function q(key, value) {
  return value ? `&${key}=${value}` : "";
}
