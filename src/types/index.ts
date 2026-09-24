export interface Property {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  description: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural' | 'Mixed-Use';
  type: 'Plot' | 'Villa' | 'Apartment' | 'Farmhouse' | 'Commercial Plot' | 'Shop';
  location: {
    area: string;
    city: string;
    address?: string;
    landmark?: string;
    mapEmbedUrl?: string;
  };
  price: number;
  priceDisplay: string;
  pricePerSqYd?: number;
  priceOnRequest: boolean;
  showPrice?: boolean;
  virtualTourUrl?: string;
  imageHighlights?: Array<{
    image?: string;
    title?: string;
    description?: string;
  }>;
  nearbyLocations?: Array<{
    name: string;
    distance: string;
    category?: string;
    icon?: string;
  }>;
  plotSizes: number[];
  sizeUnit: string;
  status: 'Ready to Move' | 'Ongoing' | 'Upcoming' | 'Sold Out';
  jdaApproved: boolean;
  reraApproved: boolean;
  reraNumber?: string;
  bankLoanAvailable: boolean;
  bankLoanDetails?: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  brochureUrl?: string;
  views?: number;
  createdAt: string;
}

export interface Enquiry {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  interestedProperty?: string;
  propertyId?: any;
  preferredLocation?: string;
  budget?: string;
  message?: string;
  source?: string;
  status: 'New' | 'Contacted' | 'Site Visit Scheduled' | 'Negotiation' | 'Closed' | 'Archived';
  internalNotes: {
    _id?: string;
    note: string;
    author: string;
    date: string;
  }[];
  createdAt: string;
}

export interface Career {
  _id: string;
  title: string;
  slug: string;
  department: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Internship' | 'Consultant';
  location: string;
  experience: string;
  salaryRange?: string;
  openings?: number;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  isActive: boolean;
  createdAt: string;
}

export interface JobApplication {
  _id: string;
  careerId?: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  experienceYears: string;
  coverLetter?: string;
  resumePath: string;
  resumeOriginalName: string;
  status: 'New' | 'Reviewed' | 'Shortlisted' | 'Interview Scheduled' | 'Rejected' | 'Hired';
  adminNotes?: string;
  createdAt: string;
}

export interface GalleryItem {
  _id: string;
  title: string;
  category: 'Project Photos' | 'Construction Progress' | 'Completed Projects' | 'Property Site Visits' | 'Events' | 'Videos';
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  location?: string;
  projectName?: string;
  isFeatured?: boolean;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
  readTime: string;
  seoTitle?: string;
  seoDescription?: string;
  views?: number;
  createdAt: string;
}

export interface WebsiteSettings {
  companyName: string;
  logoUrl?: string;
  tagline: string;
  phone: string;
  alternatePhone: string;
  whatsapp: string;
  email: string;
  address: string;
  officeTimings: string;
  mapEmbedUrl: string;
  stats: {
    yearsExperience: string;
    satisfiedClients: string;
    jdaPlotsSold: string;
    bankLoanApproval: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LocationItem {
  _id: string;
  name: string;
  slug: string;
  state?: string;
  tagline?: string;
  icon?: string;
  status: 'Active' | 'Inactive';
  isPopular?: boolean;
  displayOrder?: number;
  createdAt?: string;
}
