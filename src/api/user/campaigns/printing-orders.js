import axios from "axios";

export async function getPrintingOrder(id) {
  return (await axios.get(`/api/printing-orders/${id}`)).data;
}

export async function createPrintingOrder(data) {
  return (await axios.post(`/api/printing-orders`, data)).data;
}

export async function updatePrintingOrder(id, data) {
  return (await axios.put(`/api/printing-orders/${id}`, data)).data;
}

export async function deletePrintingOrder(id) {
  return (await axios.delete(`/api/printing-orders/${id}`)).data;
}
