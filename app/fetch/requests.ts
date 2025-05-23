const requests = {
  REFRESH_TOKEN: "api/auth/refreshToken",
  LOGOUT: "api/logout",
  USER_INFO: "api/user/info",
  UPDATE_INFO: "api/user/updateInfo",
  UPDATE_PASSWORD: "api/user/updatePassword",
  UPDATE_HP: "api/user/updateHp",
  POST_WITHDRAW: "api/user/postWithdraw",
  USER_SPACE_LIST: "api/user/spaceList",
  GET_POST_LiST: "api/post/getPostList",
  GET_POST: "api/post/getPost",
  SAVE_POST: "api/post/savePost",
  DELETE_POST: "api/post/deletePost",
  MOVE_AND_COPY_POST: "api/post/moveAndCopyPost",
  FILE_UPLOAD: "api/file/upload",
  GET_FILE: "api/file/getFile",
  GET_SPACE: "api/search/getSpace",
  GET_USER: "api/search/getUser",
  SEARCH_SPACE_LIST: "api/search/getSpaceList",
  SEARCH_USER_LIST: "api/search/getUserList",
  SEARCH_POST_LIST: "api/search/getPostList",
  SAVE_SPACE: "api/space/saveSpace",
  UPDATE_SPACE: "api/space/updateSpace",
  DELETE_SPACE: "api/space/deleteSpace",
  LEAVE_SPACE: "api/space/postLeaveSpace",
  POST_MANAGER: "api/space/postSpaceManager",
  POST_SPACE_CONTENT: "api/space/postSpaceContent",
  DELETE_SPACE_CONTENT: "api/space/deleteSpaceContent",
  POST_SPACE_MEMBER_LIST: "api/space/postSpaceMemberList",
  GET_NOTIFICATION_LIST: "api/notification/getNotificationList",
  POST_NOTIFICATION: "api/notification/postNotification",
  GET_MESSAGE_LIST: "api/message/getMessageList",
  GET_MESSAGE: "api/message/getMessage",
  POST_MESSAGE: "api/message/postMessage",
  READ_MESSAGE: "api/message/readMessage",
  DELETE_MESSAGE: "api/message/deleteMessage",
};

export default requests;
