export type SelectedDeal = {
  id: number;
  title: string;
  description: string;
  notes?: string;  
  price: number | null;
  old_price: number | null;
  percent_diff: number | null;
  store_name: string | null;
  image_link: string | null;   // <-- FIXED HERE
  slug: string;
};
