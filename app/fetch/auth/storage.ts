const getStorage = (key: string) => {
  return localStorage.getItem(key);
};

const setStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};

const getAccessToken = () => {
  return getStorage('user-access-token');
};

const setAccessToken = (value: string) => {
  return setStorage('user-access-token', value);
};

const getRefreshToken = () => {
  return getStorage('user-refresh-token');
};

const setRefreshToken = (value: string) => {
  return setStorage('user-refresh-token', value);
};

const removeToken = () => {
  removeStorage('user-access-token');
  removeStorage('user-refresh-token');
};

export default {
  getAccessToken: getAccessToken,
  setAccessToken: setAccessToken,
  getRefreshToken: getRefreshToken,
  setRefreshToken: setRefreshToken,
  removeToken: removeToken
};
