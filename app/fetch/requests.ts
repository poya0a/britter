const requests = {
  REFRESH_TOKEN: "api/auth/refreshToken",
  LOGOUT: "api/logout",
  USER_INFO: "api/user/info",
  USER_SPACE_LIST: "api/user/spaceList",
  GET_POST: "api/post/getPost",
  SAVE_POST: "api/post/savePost",
  DELETE_POST: "api/post/deletePost",
  FILE_UPLOAD: "api/file/upload",
  GET_FILE: "api/file/getFile",
  SEARCH_SPACE_LIST: "api/search/getSpaceList",
  SEARCH_USER_LIST: "api/search/getUserList",
  SEARCH_POST_LIST: "api/search/getPostList",
  SAVE_SPACE: "api/space/saveSpace",
  UPDATE_SPACE: "api/space/updateSpace",
  DELETE_SPACE: "api/space/deleteSpace",
  GET_SPACE_MEMBER_LIST: "api/space/getSpaceMemberList",
};

export default requests;
