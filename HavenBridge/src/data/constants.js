import { 
  FaShieldAlt, 
  FaChartLine, 
  FaUsers, 
  FaStar,
  FaHome,
  FaBuilding,
  FaFileContract,
  FaCalculator,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSearch,
  FaUser,
  FaCheckCircle,
  FaChevronRight,
  FaNewspaper,
  FaDownload
} from 'react-icons/fa';
// Import property images
import property1 from '../assets/property-1.jpg';  
import property2 from '../assets/property-2.jpg';
import property3 from '../assets/property-3.jpg';
import property4 from '../assets/property-4.jpg';

// Import news images
import news1 from '../assets/news1.jfif';  
import news2 from '../assets/news2.jfif';

// Add these imports at the top with other image imports
import broker1 from '../assets/broker-sarah.jpg';  // Sarah Johnson
import broker2 from '../assets/broker-michael.jpg';  // Michael Chen  
import broker3 from '../assets/broker-emma.jpg';  // Emma Williams

export const featuredProperties = [
  {
    id: 1,
    price: "$450,000",
    title: "Luxury Villa For Sale",
    location: "Premium Residencia, Downtown",
    type: "villa",
    bedrooms: 3,
    bathrooms: 2,
    area: "3,500",
    image: property1  // Added image
  },
  {
    id: 2,
    price: "$280,000",
    title: "Modern Apartment For Sale",
    location: "Sky Towers, City Center",
    type: "apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: "3,500",
    image: property2  // Added image
  },
  {
    id: 3,
    price: "$125,000",
    title: "Residential Plot For Sale",
    location: "Green Valley, Suburbs",
    type: "plot",
    bedrooms: 3,
    bathrooms: 2,
    area: "3,500",
    image: property3  // Added image
  },
  {
    id: 4,
    price: "$350,000",
    title: "Family House For Sale",
    location: "Garden Estate, North Side",
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
    area: "3,500",
    image: property4  // Added image
  }
];


export const mortgageBrokers = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "Premier Home Loans",
    location: "Downtown",
    reviews: 27,
    specialties: ["First-time buyers", "Refinancing", "Investment properties"],
    phone: "+1 (555) 123-4567",
    email: "sarah@premierloans.com",
    website: "https://www.sarahjohnson.com",
    image: broker1
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "Secure Finance Group",
    location: "City Center",
    reviews: 96,
    specialties: ["Commercial loans", "Construction finance", "Low deposit"],
    phone: "+1 (555) 234-5678",
    email: "michael@securefinance.com",
    website: "https://www.michaelchen.com",
    image: broker2
  },
  {
    id: 3,
    name: "Emma Williams",
    company: "HomeSmart Mortgage",
    location: "North Side",
    reviews: 136,
    specialties: ["Self-employed", "Bad credit", "Fast approval"],
    phone: "+1 (555) 345-6789",
    email: "emma@homersmart.com",
    website: "https://www.immortgage.com",
    image: broker3
  }
];

export const whyChooseUs = [
  {
    icon: FaShieldAlt,
    title: "Secure Transactions",
    description: "All transactions are verified and secured with advanced encryption"
  },
  {
    icon: FaChartLine,
    title: "Market Insights",
    description: "Get real-time property valuations and market trends"
  },
  {
    icon: FaUsers,
    title: "Direct Connect",
    description: "Connect directly with verified property owners"
  },
  {
    icon: FaStar,
    title: "Trusted Platform",
    description: "Join thousands of satisfied buyers and sellers"
  }
];

export const latestNews = [
  {
    id: 1,
    category: "Market Analysis",
    date: "Jan 15, 2025",
    title: "Property Market Trends for 2025",
    description: "Stay on top of real estate trends written by economists and property experts.",
    link: "/news/property-market-trends",
    image: news1
  },
  {
    id: 2,
    category: "Buying Tips",
    date: "Jan 12, 2025",
    title: "First-Time Buyer's Guide",
    description: "Read up on the ins and outs of any property process and get your finances in order.",
    link: "/news/first-time-buyers-guide",
    image: news2
  },
  // Removed "Understanding Mortgage Options" as requested
];

// Default RSS feed for live market updates (used by LiveNewsWidget)
// Point to backend proxy to avoid CORS from browser
export const NEWS_RSS_FEED = '/api/news/feed';

export const exploreCategories = [
  { id: 1, title: "Buying", icon: FaHome, description: "Find your dream home" },
  { id: 2, title: "Renting", icon: FaBuilding, description: "Discover rental properties" },
  { id: 3, title: "Selling", icon: FaFileContract, description: "Sell your property fast" },
  { id: 4, title: "Researching", icon: FaCalculator, description: "Market insights & data" }
];

export const footerLinks = {
  quickLinks: [
    { name: "About Us", href: "#" },
    { name: "Properties", href: "#" },
    { name: "Sell Property", href: "/sell" },
    { name: "Contact", href: "#" }
  ],
  services: [
    { name: "Property Valuation", href: "#" },
    { name: "Market Analysis", href: "#" },
    { name: "Legal Support", href: "#" },
    { name: "Documentation", href: "#" }
  ],
  contactInfo: {
    address: "123 Real Estate Plaza, City Center",
    phone: "+1 (555) 123-4567",
    email: "info@realestatepro.com"
  }
};



// import { 
//   FaShieldAlt, 
//   FaChartLine, 
//   FaUsers, 
//   FaStar,
//   FaHome,
//   FaBuilding,
//   FaFileContract,
//   FaCalculator,
//   FaMapMarkerAlt,
//   FaPhone,
//   FaEnvelope,
//   FaSearch,
//   FaUser,
//   FaCheckCircle,
//   FaChevronRight,
//   FaNewspaper,
//   FaDownload
// } from 'react-icons/fa';


// import news1 from '../assets/news1.jfif';  
// import news2 from '../assets/news2.jfif';
// import news3 from '../assets/news3.jfif';

// export const featuredProperties = [
//   {
//     id: 1,
//     price: "$450,000",
//     title: "Luxury Villa For Sale",
//     location: "Premium Residencia, Downtown",
//     type: "villa"
//   },
//   {
//     id: 2,
//     price: "$280,000",
//     title: "Modern Apartment For Sale",
//     location: "Sky Towers, City Center",
//     type: "apartment"
//   },
//   {
//     id: 3,
//     price: "$125,000",
//     title: "Residential Plot For Sale",
//     location: "Green Valley, Suburbs",
//     type: "plot"
//   },
//   {
//     id: 4,
//     price: "$350,000",
//     title: "Family House For Sale",
//     location: "Garden Estate, North Side",
//     type: "house"
//   }
// ];

// export const mortgageBrokers = [
//   {
//     id: 1,
//     name: "Sarah Johnson",
//     company: "Premier Home Loans",
//     location: "Downtown",
//     reviews: 27,
//     specialties: ["First-time buyers", "Refinancing", "Investment properties"],
//     phone: "+1 (555) 123-4567",
//     email: "sarah@premierloans.com",
//     website: "https://www.sarahjohnson.com"
//   },
//   {
//     id: 2,
//     name: "Michael Chen",
//     company: "Secure Finance Group",
//     location: "City Center",
//     reviews: 96,
//     specialties: ["Commercial loans", "Construction finance", "Low deposit"],
//     phone: "+1 (555) 234-5678",
//     email: "michael@securefinance.com",
//     website: "https://www.michaelchen.com"
//   },
//   {
//     id: 3,
//     name: "Emma Williams",
//     company: "HomeSmart Mortgage",
//     location: "North Side",
//     reviews: 136,
//     specialties: ["Self-employed", "Bad credit", "Fast approval"],
//     phone: "+1 (555) 345-6789",
//     email: "emma@homersmart.com",
//     website: "https://www.immortgage.com"
//   }
// ];

// export const whyChooseUs = [
//   {
//     icon: FaShieldAlt,
//     title: "Secure Transactions",
//     description: "All transactions are verified and secured with advanced encryption"
//   },
//   {
//     icon: FaChartLine,
//     title: "Market Insights",
//     description: "Get real-time property valuations and market trends"
//   },
//   {
//     icon: FaUsers,
//     title: "Direct Connect",
//     description: "Connect directly with verified property owners"
//   },
//   {
//     icon: FaStar,
//     title: "Trusted Platform",
//     description: "Join thousands of satisfied buyers and sellers"
//   }
// ];

// export const latestNews = [
//   {
//     id: 1,
//     category: "Market Analysis",
//     date: "Jan 15, 2025",
//     title: "Property Market Trends for 2025",
//     description: "Stay on top of real estate trends written by economists and property experts.",
//     link: "#"
// image: news1
//   },
//   {
//     id: 2,
//     category: "Buying Tips",
//     date: "Jan 12, 2025",
//     title: "First-Time Buyer's Guide",
//     description: "Read up on the ins and outs of any property process and get your finances in order.",
//     link: "#"
// image: news2
//   },
//   {
//     id: 3,
//     category: "Finance",
//     date: "Jan 10, 2025",
//     title: "Understanding Mortgage Options",
//     description: "Use our calculators to understand your financial position and explore different options.",
//     link: "#"
// image: news3
//   }
// ];

// export const exploreCategories = [
//   { id: 1, title: "Buying", icon: FaHome, description: "Find your dream home" },
//   { id: 2, title: "Renting", icon: FaBuilding, description: "Discover rental properties" },
//   { id: 3, title: "Selling", icon: FaFileContract, description: "Sell your property fast" },
//   { id: 4, title: "Researching", icon: FaCalculator, description: "Market insights & data" }
// ];

// export const footerLinks = {
//   quickLinks: [
//     { name: "About Us", href: "#" },
//     { name: "Properties", href: "#" },
//     { name: "Sell Property", href: "/sell" },
//     { name: "Contact", href: "#" }
//   ],
//   services: [
//     { name: "Property Valuation", href: "#" },
//     { name: "Market Analysis", href: "#" },
//     { name: "Legal Support", href: "#" },
//     { name: "Documentation", href: "#" }
//   ],
//   contactInfo: {
//     address: "123 Real Estate Plaza, City Center",
//     phone: "+1 (555) 123-4567",
//     email: "info@realestatepro.com"
//   }
// };