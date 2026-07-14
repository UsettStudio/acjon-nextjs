
// prop type
export interface offcanvasIProps {
  openOffcanvas: boolean;
  setOpenOffcanvas: React.Dispatch<React.SetStateAction<boolean>>;
  bgClassName?: string
};

//common image DT
export interface ImageDT {
  id: number,
  imgSrc: string
}

// Interface for a service item
export interface ServiceItemDt {
  id: number
  icon?: string;
  title: string;
  image?: string;
  description: string;
  svgIcon?: React.ElementType;
  num?: string;
  delay?: string;
  category?: string
  categories?: string[];
}

// ==== Interface for a testimonial ====
export interface testimonialItemDt {
  id: number,
  content: string,
  name: string,
  role?: string,
  rating?: number;
  ratingText?: string
  number?: string;
  position?: string;
  image?: string
  logo?: string;
  reviews?: number;
  platform?: string;
  company?: string;
  videoUrl?: string;

}
// ==== Interface for a team data ====
export interface teamMemberDt {
  id: number,
  name: string,
  role: string,
  image: string,
  delay: string;
  imgWidth?: number;
  imgHeight?: number;
}
// ==== Interface for a blog data ====
interface authorDt {
  name: string;
  avatar: string;
  date: string;
  comments: number,
}

export interface blogDt {
  id: number,
  image: string,
  date: string,
  category?: string,
  title: string,
  avatar?: string,
  author?: string | authorDt;
  delay?: string;
  tag?: string;
  excerpt?: string;
  type?: string;
  videoUrl?: string;
  quote?: string;
  quoteAuthor?: string;
  images?: string[]
  // author?: authorDt;

}
// ==== Interface for a project data ====
export interface projectDt {
  id: number,
  image: string,
  title: string,
  date?: string,
  year?: string;
  category?: string;
  categories?: string[];
  className?: string
}
// ==== Interface for a award data ====
export interface awardDt {
  id: number,
  number?: string,
  title: string,
  count?: number,
  image: string,
  year?: string;
  position?: string;
  label?: string;
  tags?: string[];
}
// ==== Interface for a price data ====
export interface PricingPlan {
  id: string;
  name: string;
  price?: string;
  period?: string;
  description: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  isPopular?: boolean;
  features: string[];
}

export interface PricingTier {
  monthly: PricingPlan[];
  yearly: PricingPlan[];
}

// ==== Interface for a faq data ====
export interface faqDt {
  id: string,
  question: string,
  answer: string;
  show?: boolean,
}

//define interface for PageParams props
export interface PageParamsProps {
  params: Promise<{ id: number }>;
}

// Fetch the data based on the provided 'id' prop
export interface IdProps {
  id: number;
};

export interface SkillDT {
  id: number;
  icon: string;
  percentage: number;
  label: string;
}

export interface AwardDT {
  id: number;
  title: string;
  role: string;
  date: string;
}
// ==== Interface for a product category data ====
interface activeStatusDt {
  enum: string[],
  default: string,
}
export interface categoryDT {
  img: string,
  title: string,
  status: activeStatusDt,
}

// Fetch the data based on the provided 'id' prop
export interface IdProps {
  id: number;
};

export interface pricePlanDt {
  id: number;
  title: string;
  desc: string;
  price: string;
  duration: string;
  features: string[];
  active?: boolean;
  popular?: boolean;
};
//define interface for ProductReview type
export interface ProductReview {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
};