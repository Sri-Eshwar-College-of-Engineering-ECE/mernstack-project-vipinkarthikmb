import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  FaWarehouse, FaSignInAlt, FaUserPlus, FaTruck, FaBox, FaEnvelope, 
  FaTools, FaArrowRight, FaMapMarkerAlt, FaServer, FaShoppingCart, 
  FaChartLine, FaRobot, FaHandshake 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import foodImage from '../assets/foodindustry.jpg';
import Video1 from '../assets/factoryvideo1.mp4';
import sellImage from '../assets/vendorselling.jpg';
import vendors from '../assets/vendors.webp';
import transport from '../assets/transport.jpg';
import factoryin from '../assets/factoryin.jpg';
import warehouse from '../assets/warehouse.jpg';
import PlaceOrder from '../assets/PlaceOrder.webp';
import SLA from '../assets/sla.jpg';
import Frovitrax from '../assets/Frovitrax Logo2.png';
import Landingpage1 from '../assets/Landingpage1.mp4';
import img1 from '../assets/home1.jpg';
import img2 from '../assets/home2.jpg';
import img3 from '../assets/home3.jpg';
import img4 from '../assets/home4.jpg';
import img5 from '../assets/home5.jpg';
import img6 from '../assets/home6.jpg';
import img7 from '../assets/home7.jpg';
import img8 from '../assets/home8.jpg';

const images = [img1, img2, img3, img4, img5, img6, img7, img8];

export default function Dashboard() {
  const mainRef = useRef(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSLA, setShowSLA] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Image slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Scroll detection for header
 // Scroll detection for header
useEffect(() => {
  const handleScroll = () => {
    if (mainRef.current) {
      const mainTop = mainRef.current.getBoundingClientRect().top;
      // When main section top is above the header (scrolled past it)
      setScrolled(mainTop <= 0);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);


  const howItWorksSteps = [
    {
      step: 'Step 1',
      icon: <FaBox className="text-2xl text-amber-300" />,
      title: 'Vendor',
      desc: 'Prepares and packages raw materials for dispatch.',
      image: vendors
    },
    {
      step: 'Step 2',
      icon: <FaTruck className="text-2xl text-lime-300" />,
      title: 'Transportation',
      desc: 'Logistics managed by vendors or external partners with real-time updates.',
      image: transport
    },
    {
      step: 'Step 3',
      icon: <FaWarehouse className="text-2xl text-yellow-200" />,
      title: 'Factory Intake',
      desc: 'Goods are unloaded, inspected, and verified at the factory gate.',
      image: factoryin
    },
    {
      step: 'Step 4',
      icon: <FaTools className="text-2xl text-emerald-300" />,
      title: 'Warehouse & Allocation',
      desc: 'Materials are stored and allocated for production scheduling.',
      image: warehouse
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-white text-gray-900">
      {/* Header */}
      <header
  className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-white shadow-lg rounded-b-2xl"
>
  <div className="flex items-center overflow-visible">
    <img
      src={Frovitrax}
      alt="Frovitrax Logo"
      className="h-[110px] w-auto object-contain -my-7"
    />
  </div>
  <div className="flex items-center gap-3">
  <Link to="/login">
    <button className="flex items-center gap-2 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm shadow-sm hover:shadow-md">
      <FaSignInAlt /> Login
    </button>
  </Link>

  <Link to="/signup">
    <button className="flex items-center gap-2 bg-emerald-700 border-2 border-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm">
      <FaUserPlus /> Sign Up
    </button>
  </Link>
</div>


</header>


      {/* Main */}
      <main ref={mainRef} className="pt-24 px-10 py-10 w-screen h-screen flex flex-col-reverse md:flex-row items-center justify-between gap-10 z-10 relative overflow-hidden bg-sky-100">
        {/* Left Side */}
        {/* Left Side */}
<div className="flex flex-col justify-center flex-grow basis-3/5 text-center md:text-left z-20">
  <h1 className="text-green-800 text-4xl sm:text-5xl font-extrabold mb-4 leading-tight drop-shadow-md">
  The Future of Food Industry Logistics is Here
</h1>
  <p className="text-blacke-900 text-lg sm:text-xl mb-6 max-w-lg mx-auto md:mx-0">
    A next-gen platform connecting vendors, logistics, and industries for seamless food supply management.
  </p>

</div>

        {/* Right Side Slideshow */}
        <div className="flex justify-center items-center flex-grow basis-2/5 w-full h-[60vh] md:h-[75vh] mt-12 md:mt-16 relative overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-4 ring-white/20 z-20" data-aos="fade-left">
          <img
            src={images[currentImage]}
            alt="slideshow"
            className="absolute w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-100"
            key={currentImage}
          />
          <div className="absolute bottom-4 w-full flex justify-center gap-2 z-20">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentImage === index ? 'bg-white scale-110 shadow-md' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="bg-white px-6 py-20 relative z-30">
        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-800 text-center mb-10">How It Works: From Vendor to Factory</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-16 text-center text-sm sm:text-base">
          Track how raw materials move seamlessly from trusted vendors to our factory's production line.
        </p>
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-emerald-300 z-0" />
          {howItWorksSteps.map((item, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} className="relative mb-20 flex items-center min-h-[150px]" data-aos="fade-up" data-aos-delay={i * 150}>
                <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-md" />
                </div>
                {isLeft ? (
                  <>
                    <div className="w-1/2 pr-8 text-right">
                      <div className="relative rounded-xl shadow-md border border-gray-200 px-6 py-6 inline-block text-left bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
                        <div className="absolute inset-0 bg-black/40 rounded-xl z-0" />
                        <div className="relative z-10 text-white">
                          <p className="text-xs font-bold mb-1">{item.step}</p>
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-10 mb-3">
                            {item.icon}
                          </div>
                          <h4 className="text-lg font-bold">{item.title}</h4>
                          <p className="text-sm font-semibold mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-1/2" />
                  </>
                ) : (
                  <>
                    <div className="w-1/2" />
                    <div className="w-1/2 pl-8 text-left">
                      <div className="relative rounded-xl shadow-md border border-gray-200 px-6 py-6 inline-block bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
                        <div className="absolute inset-0 bg-black/40 rounded-xl z-0" />
                        <div className="relative z-10 text-white">
                          <p className="text-xs font-bold mb-1">{item.step}</p>
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-10 mb-3">
                            {item.icon}
                          </div>
                          <h4 className="text-lg font-bold">{item.title}</h4>
                          <p className="text-sm font-semibold mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>



      
<section className="bg-emerald-50 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-emerald-800 mb-4">Start Selling Today</h2>
            <p className="text-gray-700 text-base sm:text-lg mb-6">
              Join the fastest growing supply chain platform. List your stock and connect with top industry buyers in just a few clicks.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Link to="/signup">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
                  Get Started <FaArrowRight />
                </button>
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <img src={sellImage} alt="Sell Products" className="rounded-xl shadow-lg w-full h-auto object-cover" />
            <p className="absolute bottom-4 left-4 text-sm bg-black/50 text-white px-3 py-1 rounded animate-pulse">
              Products in demand!
            </p>
          </div>
        </div>
      </section>


      <section className="bg-purple-50 py-20 px-6">
  <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10">
    <div className="flex-1 relative">
      <img src={PlaceOrder} alt="Buy Products" className="rounded-xl shadow-lg w-full h-auto object-cover" />
      <p className="absolute bottom-4 left-4 text-sm bg-black/50 text-white px-3 py-1 rounded animate-pulse">
        Trusted Vendor Inventory
      </p>
    </div>
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-3xl sm:text-4xl font-bold text-emerald-800 mb-4">Streamline Your Procurement</h2>
      <p className="text-gray-700 text-base sm:text-lg mb-6">
        Streamline your procurement process with access to a curated network of verified vendors. Browse real-time inventory, assess quality and storage standards, and initiate purchase orders with confidence—all from a single platform.
      </p>
      <div className="flex gap-4 justify-center md:justify-start">
        <Link to="/login">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
             Explore Inventory<FaArrowRight />
          </button>
        </Link>
      </div>
    </div>
  </div>
</section>
 {/*Why choose Frovitrax*/}
<div className="relative w-full min-h-screen overflow-hidden bg-sky-100">
  <section className="relative z-20 px-6 py-20 text-gray-900">
    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14 text-emerald-800">
      Why Choose FROVITRAX?
    </h2>
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {[
        {
          title: "Centralized Platform",
          description: "A single online hub to facilitate seamless interactions between managers and vendors.",
          icon: <FaServer className="text-4xl text-indigo-600 mb-4" />
        },
        {
          title: "Automated Procurement",
          description: "Streamlines procurement workflows to reduce delays and minimize human error.",
          icon: <FaShoppingCart className="text-4xl text-indigo-600 mb-4" />
        },
        {
          title: "Real-Time Inventory",
          description: "Track orders, inventory, and vendor supplies instantly with up-to-date dashboards.",
          icon: <FaChartLine className="text-4xl text-indigo-600 mb-4" />
        },
        {
          title: "End-to-End Tracking",
          description: "Monitor products throughout transit using embedded devices, ensuring quality and timely delivery.",
          icon: <FaTruck className="text-4xl text-indigo-600 mb-4" />
        },
        {
          title: "AI-Powered Insights",
          description: "Leverage AI for predictive analytics, automated quality checks, risk alerts, and demand forecasting.",
          icon: <FaRobot className="text-4xl text-indigo-600 mb-4" />
        },
        {
          title: "Service Level Agreement",
          description: "Ensures transparency, reliability, and efficient collaboration between managers and vendors with clearly defined SLA terms.",
          icon: <FaHandshake className="text-4xl text-indigo-600 mb-4" />
        }
      ].map((feature, index) => (
        <div
          key={index}
          className="group animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
        >
          <div className="relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180 cursor-pointer rounded-3xl shadow-2xl border border-gray-200">
            {/* Front Side */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 text-gray-900 rounded-3xl shadow-2xl flex flex-col items-center justify-center px-6 py-6 backface-hidden">
              {feature.icon}
              <h3 className="text-xl font-bold text-center">{feature.title}</h3>
            </div>
            {/* Back Side */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 text-gray-900 rounded-3xl shadow-2xl flex flex-col items-center justify-center px-6 py-6 rotate-y-180 backface-hidden">
              <h3 className="text-xl font-bold text-center mb-2">{feature.title}</h3>
              <p className="text-sm text-center leading-relaxed">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
</div>




<section className="bg-gray-100 py-20 px-6">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
    {/* Left Side: Text + Button */}
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-3xl sm:text-4xl font-bold text-emerald-800 mb-4">Service Level Agreement</h2>
      <p className="text-gray-700 text-base sm:text-lg mb-6">
        Our SLA helps ensure transparency, trust, and efficient collaboration between all supply chain partners.
      </p>
      <p className="text-emerald-700 text-base sm:text-lg font-medium mb-6">
        If you want to view the SLA agreement, click the button below.
      </p>
      <button
        onClick={() => setShowSLA(true)}
        className="bg-gradient-to-r from-emerald-600 to-lime-500 hover:scale-105 transform transition text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
      >
        View SLA Agreement
      </button>
    </div>

    {/* Right Side: Image with animation */}
    <div className="flex-1">
      <div className="overflow-hidden rounded-xl shadow-xl transform hover:scale-105 transition duration-500 ease-in-out">
        <img
          src={SLA}
          alt="SLA Image"
          className="w-full h-auto object-cover rounded-xl"
        />
      </div>
    </div>
  </div>
</section>

{showSLA && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
    <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 relative">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4 text-center">Service Level Agreement (SLA)</h2>
      <p className="text-gray-700 text-sm sm:text-base mb-6 text-center">
        Our SLA outlines the mutual expectations between vendors and buyers to ensure transparency, reliability, and operational efficiency throughout the supply chain process.
      </p>

      <div className="text-left space-y-4">
        <h3 className="text-lg font-semibold text-emerald-700">Key Terms & Conditions:</h3>
        <ul className="list-disc list-inside text-gray-800 space-y-3 text-sm sm:text-base">
          <li><strong>Stock Accuracy:</strong> Vendors must maintain up-to-date and truthful listings of quantities and storage conditions.</li>
          <li><strong>Timely Dispatch:</strong> Vendors must dispatch accepted orders within the agreed-upon timeframe (typically 24–72 hours).</li>
          <li><strong>Delivery Window:</strong> Logistics partners are expected to deliver goods within 48–96 hours unless specified otherwise.</li>
          <li><strong>Quality Assurance:</strong> All products must meet pre-approved quality benchmarks. Any substandard delivery may result in penalties or return.</li>
          <li><strong>Cancellation Policy:</strong> Buyers may cancel an order before dispatch. Vendors must acknowledge cancellations and initiate refunds within 48 hours.</li>
          <li><strong>Dispute Resolution:</strong> In case of delivery failures or stock discrepancies, a resolution process will be initiated within 3 working days.</li>
          <li><strong>Platform Responsibility:</strong> Frovitrax acts as a mediator and will facilitate communication, logs, and documentation in case of SLA breach.</li>
          <li><strong>Violation Consequences:</strong> Repeated SLA violations may result in reduced visibility, platform suspension, or blacklisting.</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <a
          href="/FOODCHAINX SLA AGREEMENT.pdf"
          download
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transform transition px-6 py-2 rounded-lg text-white font-semibold shadow-lg"
        >
          📄 Download SLA PDF
        </a>
        <button
          onClick={() => setShowSLA(false)}
          className="text-gray-500 hover:text-emerald-700 text-xl absolute top-4 right-5"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
)}


      <footer className="bg-white text-gray-900 px-6 py-14 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
          <div className="flex-1 space-y-4 animate-fade-in-left">
            <h3 className="text-2xl font-bold text-emerald-700">Let's Connect</h3>
            <p className="text-sm text-gray-600 max-w-md">
              Whether you're a vendor or a manager, we're here to assist you with seamless food supply chain integration.
            </p>
          </div>
          <div className="flex-1 space-y-5 animate-fade-in-right">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <FaEnvelope className="text-xl text-emerald-600" />
              <span className="text-sm font-medium">support@frovitrax.com</span>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <FaMapMarkerAlt className="text-xl text-emerald-600" />
              <span className="text-sm font-medium">Coimbatore, Tamil Nadu, India</span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 text-center md:text-left">
          <p className="mb-2 md:mb-0">&copy; 2025 FROVITRAX. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => setShowTerms(true)} className="hover:text-emerald-700 transition">Terms of Service</button>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-emerald-700 transition">Privacy Policy</button>
          </div>
        </div>
      </footer>

      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-lg max-w-3xl max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold text-emerald-700 mb-4">Terms of Service</h2>
            <p className="text-sm text-gray-700 mb-4">
              By using the FROVITRAX platform, you confirm that you are at least 18 years old or legally permitted to operate as a vendor or manager in your region. You are solely responsible for maintaining the confidentiality of your login credentials. Vendors must publish only accurate stock and delivery information, while managers are expected to make legitimate procurement requests. Although we aim for high uptime and service accuracy, Frovitrax is not liable for temporary service interruptions or inaccuracies from third-party sources such as logistics updates. We reserve the right to suspend or terminate any account found violating platform integrity—such as through spamming, fraudulent listings, or abusive behavior—or any applicable legal requirements. All branding, technology, and content on the platform remain the exclusive intellectual property of the Frovitrax team and may not be copied or reused without written permission. These Terms of Service may be updated periodically, and continued use of the platform signifies acceptance of any modifications. For assistance or questions, please contact us at support@frovitrax.com.
            </p>
            <button onClick={() => setShowTerms(false)} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-lg max-w-3xl max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold text-emerald-700 mb-4">Privacy Policy</h2>
            <p className="text-sm text-gray-700 mb-4">
              At FROVITRAX, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
We collect personal information such as your name, email address, business name, and contact details. Additionally, we gather usage data including your device information, IP address, location (if enabled), and interactions on our platform. We also track transactional details such as orders, deliveries, and vendor or manager activity to enhance your overall experience.
Your information is used to provide and manage our services, authenticate users, manage accounts, communicate updates or promotions, and continuously improve our platform. We do not sell your personal data. We may only share it with logistics and delivery partners for operational purposes, with your consent, or when required by law.
To ensure your data is secure, we implement strong safeguards such as encryption, access controls, and secure storage systems. You have the right to access or update your information, request account deletion, or opt out of promotional communications at any time.
We may update this Privacy Policy occasionally, and any significant changes will be communicated via email or a notification on the platform. If you have any questions or concerns regarding your privacy, please reach out to us at support@frovitrax.com.
            </p>
            <button onClick={() => setShowPrivacy(false)} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}
      </div>
  );
}




   