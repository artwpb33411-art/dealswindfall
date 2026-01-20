import { getFacebookVariant } from "./facebookCommentVariants";


export async function buildFacebookComment({
  isAffiliate,
  lang,
  dealUrl,
  affiliateUrl,
}: {
  isAffiliate: boolean;
  lang: "en" | "es";
  dealUrl: string;
  affiliateUrl?: string;
}) {
  const intro = await getFacebookVariant("intro", lang);
  const brand = await getFacebookVariant("brand", lang);

  const disclosure = isAffiliate
    ? await getFacebookVariant("disclosure", lang)
    : null;

  const link = isAffiliate ? affiliateUrl : dealUrl;

  return [
    intro,
    link,
    disclosure,
    brand,
  ]
    .filter(Boolean)
    .join("\n\n");
}
