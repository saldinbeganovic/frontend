import axios from "axios";

export async function getDocsDownloadFile(id, unitId, config = {}) {
  return (
    await axios.get(`/api/units/${unitId}/documentation/${id}/download`, config)
  ).data;
}
