import { FaHandshake, FaSearch, FaShieldAlt } from 'react-icons/fa';

const SellHero = () => {
  // const handleValuation = () => {
  //   const address = document.querySelector('.valuation-input')?.value;
  //   if (address && address.trim()) {
  //     alert(`Getting instant valuation for:\n${address}\n\nEstimated Value: PKR 7,500,000 - 8,200,000`);
  //   } else {
  //     alert('Please enter a property address for valuation.');
  //   }
  // };
  return (
    <section className="bg-linear-to-r from-teal-600 to-teal-500 text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px sm:80px 80px md:100px 100px'}}>
        </div>
      </div>

      <div className="text-center relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-2 sm:px-0">Sell Your Property Fast</h1>
        <p className="text-lg sm:text-xl text-teal-100 max-w-2xl mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
          Take control and sell your property directly to a vetted buyer
        </p>
        {/* <div className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-xl">
            <input 
              type="text" 
              placeholder="Enter your property address for instant valuation" 
              className="flex-1 px-6 py-4 text-gray-900 outline-none valuation-input"
            />
            <button 
              onClick={handleValuation}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 transition-colors flex items-center justify-center gap-2"
            >
              <FaSearch /> Get Free Valuation
            </button>
          </div>
          <p className="text-teal-200 text-sm mt-3">Get an instant estimated value of your property</p>
        </div> */}
        <div className="mt-10 sm:mt-12 hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
              <FaChartLine className="text-teal-300" />
            </div>
            <span className="text-teal-100">Instant Valuation</span>
          </div> */}
          <div className="flex items-center justify-center gap-3 p-3 sm:p-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <FaHandshake className="text-orange-300 text-sm sm:text-base" />
            </div>
            <span className="text-teal-100 text-sm sm:text-base">Transparent Process</span>
          </div>

          <div className="flex items-center justify-center gap-3 p-3 sm:p-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <FaShieldAlt className="text-orange-300 text-sm sm:text-base" />
            </div>
            <span className="text-teal-100 text-sm sm:text-base">Secure Transactions</span>
          </div>

          <div className="flex items-center justify-center gap-3 p-3 sm:p-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <FaSearch className="text-orange-300 text-sm sm:text-base" />
            </div>
            <span className="text-teal-100 text-sm sm:text-base">Verified Buyers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellHero;
