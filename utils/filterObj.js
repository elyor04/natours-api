function filterObj(obj, ...keys) {
  const newObj = {};
  for (const key in obj) {
    if (keys.includes(key)) newObj[key] = obj[key];
  }
  return newObj;
}

module.exports = filterObj;
