import axios from "axios";
import { calcAxiosProgress } from "@/utils/utils";

export async function getVisualCampaignsOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/visual-campaigns`)).data;
}

export async function getArchivedVisualCampaignsOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/visual-campaigns?completed=1`))
    .data;
}

export async function getVisualCampaign(id) {
  return (await axios.get(`/api/visual-campaigns/${id}`)).data;
}
export async function deleteVisualCampaign(id) {
  return (await axios.delete(`/api/visual-campaigns/${id}`)).data;
}

export async function createVisualCampaign(data) {
  return (await axios.post(`/api/visual-campaigns`, data)).data;
}

export async function updateCampaign(id, data) {
  return (await axios.put(`/api/visual-campaigns/${id}`, data)).data;
}

export async function updateCampaignStatus(id, data) {
  return (await axios.post(`/api/visual-campaigns/${id}/change-status`, data))
    .data;
}

export async function orderPrinting(id) {
  return (await axios.post(`/api/visual-campaigns/${id}/order-printing`)).data;
}

export async function orderDecorating(id, data) {
  return (
    await axios.post(`/api/visual-campaigns/${id}/order-decorating`, data)
  ).data;
}

export function uploadCampaignGraphic(data, onUploadProgress) {
  const source = axios.CancelToken.source();
  const response = axios({
    method: "post",
    url: "/api/graphic-files",
    headers: { "Content-Type": "multipart/form-data" },
    data,
    cancelToken: source.token,
    onUploadProgress: e => calcAxiosProgress(e, onUploadProgress)
  });
  return { response, cancel: source.cancel };
}
