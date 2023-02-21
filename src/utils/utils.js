export function formatTableField(value) {
  return value || "-";
}

export function formatText(value, max = 20) {
  return value && value.length > max
    ? `${value.substring(0, max)}...`
    : value || "-";
}

export function formatDate(value, withTime = false, fromGtmToLocal = false, plusDva = false) {
  // need to check that second argument is "true" and not "truthy"
  var datetime = new Date(value);
    if (withTime === true) {
      if(plusDva === true){
        
        datetime.setHours(datetime.getHours()+1); 
        
      }
    if (fromGtmToLocal === true) {
      return new Date(datetime)
        .toLocaleString()
        .split(" ")
        .slice(0, 5)
        .join(" ");
    }else{ 
      return new Date(datetime)
      .toString()
      .split(" ")
      .slice(0, 5)
      .join(" ");
    }
   
     
  }
  if (fromGtmToLocal === true) {
    return datetime ? new Date(datetime).toLocaleDateString() : null;
  }

  return datetime ? new Date(datetime).toDateString() : null;
}

export function formatError(e) {
  if (!e.response) {
    return e.message;
  }
  if (e.response.data && e.response.data.errors) {
    return e.response.data.errors[Object.keys(e.response.data.errors)[0]][0];
  }
  return e.response.data && e.response.data.message
    ? e.response.data.message
    : e.message;
}

export function calcAxiosProgress(progressEvent, cb) {
  // calculates progress in %
  cb(Math.round((progressEvent.loaded / progressEvent.total) * 100));
}

export function deep(obj, path) {
  const parts = path ? path.split(".") : [];
  let current = obj;
  for (let part of parts) {
    if (current[part]) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }
  return current;
}

export function formatShippingType(typeId) {
  switch (typeId) {
    case 1:
      return "To each Point of Sale";
    case 2:
      return "To group headquarters";
    case 3:
      return "To a new address";
    default:
      return "-";
  }
}
