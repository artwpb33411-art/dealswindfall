export interface SelectedDeal {
  id: number;

  // Display fields
  title: string | null;          // maps from description
  description: string | null;    // maps from notes
  image_link: string | null;
  slug: string | null;
  store_name: string | null;

  // Normalized pricing used across flyers + captions
  price: number | null;          // maps from current_price
  old_price: number | null;
  percent_diff: number | null;

  // Optional fields
  current_price?: number | null;
  price_diff?: number | null;
  product_link?: string | null;
  review_link?: string | null;

  [key: string]: any;
}
