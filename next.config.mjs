/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/:userId/api/user/info",
        destination: "/api/user/info",
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
        source: "/:userId/api/file/upload",
        destination: "/api/file/upload",
      },

      {
        source: "/:userId/api/file/getFile",
        destination: "/api/file/getFile",
      },
    ];
  },
};

export default nextConfig;
