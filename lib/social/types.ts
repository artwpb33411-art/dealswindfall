export type SelectedDeal = {
  id: number;

  title?: string | null;
  description?: string | null;
  description_es?: string | null;
  notes?: string | null;
  notes_es?: string | null;

  flyer_text_en?: string | null;
  flyer_text_es?: string | null;

  image_link?: string | null;
  slug?: string | null;
  store_name?: string | null;

  price: number | null;
  old_price?: number | null;
  percent_diff?: number | null;
  current_price?: number | null;
  price_diff?: number | null;

  product_link?: string | null;
  review_link?: string | null;

  affiliate_url?: string | null;

  /** ✅ ADD THIS */
  is_affiliate?: boolean;
};
