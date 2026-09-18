import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Uploads de arquivo (PDFs de executivo, fotos, anexos) passam pelas
    // Server Actions — o padrão do Next é 1MB, o que já rejeita quase
    // qualquer PDF real com desenho técnico.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
