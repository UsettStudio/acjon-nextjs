export interface ProductImage {
  img: string;
}

export interface ProductDt {
  id: number;
  title: string;
  slug: string;
  parent: string;
  children: string;
  image: string;
  originalPrice: string;
  price: string;
  discount: number;
  quantity: number;
  type: string;
  tag: string[];
  SKU: string;
  shortDesc: string;
  description: string;
  reviews: number;
  relatedImages: ProductImage[];
  topRated?: boolean;
  badge?: string;
  bestSelling?:boolean;
  latestProduct?:boolean;
}
