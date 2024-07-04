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
  return getStorage("user-access-token");
};

const setAccessToken = (value: string) => {
  return setStorage("user-access-token", value);
};

const getRefreshToken = () => {
  return getStorage("user-refresh-token");
};

const setRefreshToken = (value: string) => {
  return setStorage("user-refresh-token", value);
};

const getUserId = () => {
  return getStorage("user-id");
};

const setUserId = (value: string) => {
  return setStorage("user-id", value);
};

const getExpandedPosts = () => {
  return getStorage("expanded-posts");
};

const setExpandedPosts = (value: string) => {
  return setStorage("expanded-posts", value);
};

const removeToken = () => {
  removeStorage("user-access-token");
  removeStorage("user-refresh-token");
  removeStorage("user-id");
  removeStorage("expanded-posts");
};

export default {
  getAccessToken: getAccessToken,
  setAccessToken: setAccessToken,
  getRefreshToken: getRefreshToken,
  setRefreshToken: setRefreshToken,
  getUserId: getUserId,
  setUserId: setUserId,
  setExpandedPosts: setExpandedPosts,
  getExpandedPosts: getExpandedPosts,
  removeToken: removeToken,
};
