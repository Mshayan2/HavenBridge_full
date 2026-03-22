import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedProperties from '../components/FeaturedProperties';
import ExploreSection from '../components/ExploreSection';
import NewsSection from '../components/NewsSection';
import WhyChooseUs from '../components/WhyChooseUs';
// import WhyChooseUs from '../components/WhyChooseUs';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white">
      <HeroSection />
      <FeaturedProperties />
      <ExploreSection />
      <NewsSection />
      <WhyChooseUs />
    </div>
  );
};

export default HomePage;