/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
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
    ];
  },
};

export default nextConfig;
