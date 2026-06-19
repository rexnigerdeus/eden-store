import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Taille max des payloads pour les Server Actions.
  // Par défaut Next.js limite à 1 Mo, ce qui est largement insuffisant
  // pour notre formulaire de création produit (cover + photo réelle + vidéo 15s).
  // On monte à 60 Mo pour couvrir le cas d'une vidéo de 50 Mo + 2 images.
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb',
    },
  },

  // Headers COOP / COEP pour autoriser SharedArrayBuffer.
  // ffmpeg.wasm les utilise pour le multi-threading (encodage vidéo plus rapide).
  // - COEP: 'credentialless' est plus permissif que 'require-corp' : il autorise
  //   les ressources cross-origin SANS qu'elles aient besoin du header CORP
  //   (important car Supabase Storage, Unsplash, etc. ne le renvoient pas).
  // - On ne les applique QUE sur la page de création produit pour ne pas
  //   impacter le reste du site.
  async headers() {
    return [
      {
        source: '/seller/dashboard/products/new',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ]
  },
};

export default nextConfig;
