import { getFacebookVariant } from "./facebookCommentVariants";


export async function buildFacebookComment({
  isAffiliate,
  lang,
  dealUrl,
  affiliateShortUrl,
  productLink,
}: {
  isAffiliate: boolean;
  lang: "en" | "es";
  dealUrl: string;
  affiliateShortUrl?: string;
  productLink?: string;
}) {

  const intro = await getFacebookVariant("intro", lang);
  const brand = await getFacebookVariant("brand", lang);

  const disclosure = isAffiliate
    ? await getFacebookVariant("disclosure", lang)
    : null;

 const link = isAffiliate
  ? affiliateShortUrl || productLink || dealUrl
  : dealUrl;



  return [
    intro,
    link,
    disclosure,
    brand,
  ]
    .filter(Boolean)
    .join("\n\n");
}
