import axios from "axios";
import { calcAxiosProgress } from "@/utils/utils";
const CancelToken = axios.CancelToken;

export async function getVideos() {
  return (await axios.get(`/api/videos`)).data;
}

export async function getVideosOfCompany(companyId) {
  return (await axios.get(`/api/companies/${companyId}/videos`)).data;
}
export async function getArchivedVideosOfCompany(companyId) {
  return (await axios.get(`/api/companies/${companyId}/videos?archived=1`))
    .data;
}

export async function getVideoMetadata(companyId) {
  return (await axios.get(`/api/companies/${companyId}/videos/meta-data`)).data;
}

export async function getVideo(id) {
  return (await axios.get(`/api/videos/${id}`)).data;
}

export function createVideo(data, onUploadProgress) {
  // cancel upload request using axios cancel token
  // https://github.com/axios/axios#cancellation
  const source = CancelToken.source();
  const response = axios({
    method: "post",
    url: "/api/videos",
    headers: { "Content-Type": "multipart/form-data" },
    data,
    cancelToken: source.token,
    onUploadProgress: e => calcAxiosProgress(e, onUploadProgress)
  });
  return { response, cancel: source.cancel };
}

export function createPlaylistVideo(data, onUploadProgress) {
  // cancel upload request using axios cancel token
  // https://github.com/axios/axios#cancellation
  const source = CancelToken.source();
  const response = axios({
    method: "post",
    url: "/api/playlists",
    headers: { "Content-Type": "multipart/form-data", "Access-Control-Allow-Origin":"*" },
    data,
    cancelToken: source.token,
    onUploadProgress: e => calcAxiosProgress(e, onUploadProgress)
  });
  return { response, cancel: source.cancel };
}

export async function updateVideo(id, data) {
  return (await axios.put(`/api/videos/${id}`, data)).data;
}

export async function deleteVideo(id) {
  return (await axios.delete(`/api/videos/${id}`)).data;
}

export async function archiveVideo(id) {
  return (await axios.put(`/api/videos/${id}/archive`)).data;
}

export async function unarchiveVideo(id) {
  return (await axios.put(`/api/videos/${id}/unarchive`)).data;
}

export async function deleteSchedule(id) {
  return (await axios.delete(`/api/video-schedules/${id}`)).data;
}
