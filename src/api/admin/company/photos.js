import axios from "axios";

export async function getPosPhotos(posId) {
  return (await axios.get(`/api/point-of-sale/${posId}/photos`)).data;
}

export async function getPosPhoto(posId, photoId) {
  return (await axios.get(`/api/point-of-sale/${posId}/photos/${photoId}`))
    .data;
}

export async function createPosPhoto(posId, data) {
  return (await axios.post(`/api/point-of-sale/${posId}/photos`, data)).data;
}

export async function updatePosPhoto(posId, photoId, data) {
  return (
    await axios.put(`/api/point-of-sale/${posId}/photos/${photoId}`, data)
  ).data;
}

export async function deletePosPhoto(posId, photoId) {
  return (await axios.delete(`/api/point-of-sale/${posId}/photos/${photoId}`))
    .data;
}
