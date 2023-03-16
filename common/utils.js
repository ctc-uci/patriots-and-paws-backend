const isNumeric = (value, errorMessage) => {
  if (!/^\d+$/.test(value)) {
    throw new Error(errorMessage);
  }
};

const isBoolean = (value, errorMessage) => {
  if (![true, false, 'true', 'false'].includes(value)) {
    throw new Error(errorMessage);
  }
};

const isZipCode = (value, errorMessage) => {
  if (!/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value)) {
    throw new Error(errorMessage);
  }
};

const isAlphaNumeric = (value, errorMessage) => {
  if (!/^[0-9a-zA-Z]+$/.test(value)) {
    throw new Error(errorMessage);
  }
};

const isPhoneNumber = (value, errorMessage) => {
  if (!/^\d+$/.test(value) || value.length > 15) {
    throw new Error(errorMessage);
  }
};

// toCamel, isArray, and isObject are helper functions used within utils only
const toCamel = (s) => {
  return s.replace(/([-_][a-z])/g, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

const isArray = (a) => {
  return Array.isArray(a);
};

const isISODate = (str) => {
  try {
    const ISOString = str.toISOString();
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(ISOString)) return false;
    const d = new Date(ISOString);
    return d.toISOString() === ISOString;
  } catch (err) {
    return false;
  }
};

const isObject = (o) => {
  return o === Object(o) && !isArray(o) && typeof o !== 'function' && !isISODate(o);
};

// Database columns are in snake case. JavaScript is suppose to be in camel case
// This function converts the keys from the sql query to camel case so it follows JavaScript conventions
const keysToCamel = (data) => {
  if (isObject(data)) {
    const newData = {};
    Object.keys(data).forEach((key) => {
      newData[toCamel(key)] = keysToCamel(data[key]);
    });
    return newData;
  }
  if (isArray(data)) {
    return data.map((i) => {
      return keysToCamel(i);
    });
  }
  if (
    typeof data === 'string' &&
    data.length > 0 &&
    data[0] === '{' &&
    data[data.length - 1] === '}'
  ) {
    let parsedList = data.replaceAll('"', '');
    parsedList = parsedList.slice(1, parsedList.length - 1).split(',');
    return parsedList;
  }
  return data;
};

const donationsQuery = `SELECT
d.id, d.route_id, d.order_num, d.status,
d.address_street, d.address_city, d.address_unit,
d.address_zip, d.first_name, d.last_name, d.email,
d.phone_num, d.notes, d.submitted_date, relation3.pickup_date,
COALESCE(relation1.furniture, '{}') AS furniture,
COALESCE(relation2.pictures, '{}') AS pictures
FROM donations AS d
LEFT JOIN (SELECT f.donation_id,
      array_agg(json_build_object('id', f.id, 'name', f.name, 'count', f.count)) AS furniture
      FROM furniture AS f
      GROUP BY f.donation_id
    ) AS relation1
ON relation1.donation_id = d.id
LEFT JOIN (SELECT pics.donation_id,
      array_agg(json_build_object('id', pics.id, 'image_url', pics.image_url, 'notes', pics.notes)) AS pictures
      FROM pictures AS pics
      GROUP BY pics.donation_id
    ) AS relation2
ON relation2.donation_id = d.id
LEFT JOIN (
  SELECT id AS route_id, date as pickup_date
  FROM routes
) AS relation3
ON relation3.route_id = d.route_id
ORDER BY d.order_num`;

const diffArray = (ids, arr) => {
  const oldArr = new Set(ids.map(({ id }) => id));
  const newArr = {};
  arr.forEach((f) => {
    newArr[f.id] = f;
  });

  const putArr = arr.filter((f) => f.id).map(({ id }) => newArr[id]);
  const postArr = arr.filter((f) => !f.id);
  arr.filter((f) => f.id).forEach(({ id }) => oldArr.delete(id));
  const delArr = [...oldArr].map((id) => ({ id }));

  return { putArr, postArr, delArr };
};

module.exports = {
  isNumeric,
  isBoolean,
  isZipCode,
  isAlphaNumeric,
  isPhoneNumber,
  keysToCamel,
  donationsQuery,
  diffArray,
};
