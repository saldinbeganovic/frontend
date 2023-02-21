import axios from "axios";

export async function getDecoratingOrder(id) {
  return (await axios.get(`/api/decorating-orders/${id}`)).data;
}

export async function createDecoratingOrder(data) {
  return (await axios.post(`/api/decorating-orders`, data)).data;
}

export async function updateDecoratingOrder(id, data) {
  return (await axios.put(`/api/decorating-orders/${id}`, data)).data;
}

export async function deleteDecoratingOrder(id) {
  return (await axios.delete(`/api/decorating-orders/${id}`)).data;
}
