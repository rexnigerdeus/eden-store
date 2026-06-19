-- Migration: Preuve de paiement vendeur + médias produit (photo réelle + vidéo 15s)
-- Date: 2026-06-19
--
-- Cette migration ajoute :
--   1) shops.payment_proof_url : URL de la capture d'écran fournie par le vendeur
--      lorsqu'il notifie l'admin d'un paiement d'abonnement (Wave / Orange Money).
--   2) products.real_image_url  : photo réelle de l'article (différente de la
--      cover de mise en avant), exigée pour la conformité produit.
--   3) products.video_url       : vidéo de démonstration du produit (≤ 15 s).
--   4) products.media_compliance_accepted : case cochée par le vendeur certifiant
--      que les médias représentent fidèlement l'article réel.

-- 1) Preuve de paiement (shops)
ALTER TABLE "public"."shops"
    ADD COLUMN IF NOT EXISTS "payment_proof_url" "text";

COMMENT ON COLUMN "public"."shops"."payment_proof_url"
    IS 'URL publique (Supabase Storage) de la capture d''écran du paiement fournie par le vendeur.';

-- 2) Médias produit
ALTER TABLE "public"."products"
    ADD COLUMN IF NOT EXISTS "real_image_url" "text",
    ADD COLUMN IF NOT EXISTS "video_url" "text",
    ADD COLUMN IF NOT EXISTS "media_compliance_accepted" boolean DEFAULT false;

COMMENT ON COLUMN "public"."products"."real_image_url"
    IS 'Photo réelle de l''article (distincte de la cover). Utilisée pour la conformité produit.';
COMMENT ON COLUMN "public"."products"."video_url"
    IS 'Vidéo de démonstration du produit (≤ 15 s).';
COMMENT ON COLUMN "public"."products"."media_compliance_accepted"
    IS 'Le vendeur certifie que les images et la vidéo représentent fidèlement l''article réel qu''il livrera.';
