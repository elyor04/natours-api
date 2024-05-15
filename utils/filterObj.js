const filterObj = (obj, ...keys) => {
  const newObj = {};
  keys.forEach((key) => {
    if (key in obj) newObj[key] = obj[key];
  });
  return newObj;
};

module.exports = filterObj;
