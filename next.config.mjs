/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  reactStrictMode: false,
  swcMinify: true,
  async rewrites() {
    return [
      // 사용자 정보
      {
        source: "/:userId/api/user/info",
        destination: "/api/user/info",
      },
      {
        source: "/:userId/api/user/spaceList",
        destination: "/api/user/spaceList",
      },
      // 스페이스
      {
        source: "/:userId/api/space/getSpaceMemberList",
        destination: "/api/space/getSpaceMemberList",
      },
      {
        source: "/:userId/api/space/saveSpace",
        destination: "/api/space/saveSpace",
      },
      {
        source: "/:userId/api/space/updateSpace",
        destination: "/api/space/updateSpace",
      },
      {
        source: "/:userId/api/space/deleteSpace",
        destination: "/api/space/deleteSpace",
      },
      {
        source: "/:userId/api/space/postLeaveSpace",
        destination: "/api/space/postLeaveSpace",
      },
      // 게시글
      {
        source: "/:userId/api/post/getPostList",
        destination: "/api/post/getPostList",
      },
      {
        source: "/:userId/api/post/getPost",
        destination: "/api/post/getPost",
      },
      {
        source: "/:userId/api/post/savePost",
        destination: "/api/post/savePost",
      },
      {
        source: "/:userId/api/post/deletePost",
        destination: "/api/post/deletePost",
      },
      {
        source: "/:userId/api/post/moveAndCopyPost",
        destination: "/api/post/moveAndCopyPost",
      },
      // 파일
      {
        source: "/:userId/api/file/upload",
        destination: "/api/file/upload",
      },
      {
        source: "/:userId/api/file/getFile",
        destination: "/api/file/getFile",
      },
      {
        source: "/:userId/api/file/getFile",
        destination: "/api/file/getFile",
      },
      // 알림
      {
        source: "/:userId/api/notification/getNotificationList",
        destination: "/api/notification/getNotificationList",
      },
      {
        source: "/:userId/api/notification/getNotification",
        destination: "/api/notification/getNotification",
      },
      {
        source: "/:userId/api/notification/postNotification",
        destination: "/api/notification/postNotification",
      },
      // 검색
      {
        source: "/:userId/api/search/getPostList",
        destination: "/api/search/getPostList",
      },
      {
        source: "/:userId/api/search/getSpaceList",
        destination: "/api/search/getSpaceList",
      },
      {
        source: "/:userId/api/search/getSpace",
        destination: "/api/search/getSpace",
      },
      {
        source: "/:userId/api/search/getUserList",
        destination: "/api/search/getUserList",
      },
      {
        source: "/:userId/api/search/getUser",
        destination: "/api/search/getUser",
      },
      // 메시지
      {
        source: "/:userId/api/message/getMessageList",
        destination: "/api/message/getMessageList",
      },
      {
        source: "/:userId/api/message/getMessage",
        destination: "/api/message/getMessage",
      },
      {
        source: "/:userId/api/message/postMessage",
        destination: "/api/message/postMessage",
      },
    ];
  },
};

export default nextConfig;
