/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    swcMinify: true,
    async redirects() {
      return [
        {
          source: "/",
          destination: "/dashboard",
          permanent: false,
        },
      ];
    },
  };
  
  export default nextConfig;
  