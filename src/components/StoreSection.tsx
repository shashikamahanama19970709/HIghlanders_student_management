'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ArrowUpRight, 
  Star, 
  ShieldCheck, 
  Globe, 
  Truck,
  ChevronRight,
  Award,
  Dumbbell,
  Flame,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface Product {
  name: string;
  price: string;
  rating: number;
  tag: string;
  category: string;
  iconName: string;
  imageUrl?: string | null;
  buyUrl: string;
}

interface FallbackProduct extends Product {
  sportCategory: string;
}

interface SportCategory {
  id: string;
  name: string;
  tagline: string;
  icon: React.ReactNode;
}

const StoreSection = () => {
  const [activeCategory, setActiveCategory] = useState<string>('cricket');
  const [liveProducts, setLiveProducts] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await fetch('/api/store-products');
        const json = await res.json();
        if (json.success && json.data) {
          setLiveProducts(json.data);
        }
      } catch (err) {
        console.error('Failed to load live store products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveProducts();
  }, []);

  const categories: SportCategory[] = [
    {
      id: 'cricket',
      name: 'Cricket',
      tagline: 'Elite bats, protective pads, and match balls',
      icon: <Award className="w-5 h-5" />
    },
    {
      id: 'fitness',
      name: 'Gym & Fitness',
      tagline: 'Dumbbells, barbells, and resistance tools',
      icon: <Dumbbell className="w-5 h-5" />
    },
    {
      id: 'combat',
      name: 'Martial Arts',
      tagline: 'Professional TKD protectors & MMA sparring gloves',
      icon: <Flame className="w-5 h-5" />
    },
    {
      id: 'football',
      name: 'Football',
      tagline: 'FIFA-grade training balls and agility accessories',
      icon: <Sparkles className="w-5 h-5" />
    }
  ];

  const fallbackProducts: FallbackProduct[] = [
    {
      name: 'Kookaburra Alex Carey Players Replica Bat',
      price: '£200.00',
      rating: 5.0,
      tag: 'Limited Edition',
      category: 'Cricket',
      iconName: 'bat',
      buyUrl: 'https://highlandersfitness.store/shop-by-sport',
      sportCategory: 'cricket'
    },
    {
      name: 'Highlanders Professional Batting Gloves',
      price: '£35.00',
      rating: 4.9,
      tag: 'New Arrival',
      category: 'Cricket',
      iconName: 'glove',
      buyUrl: 'https://highlandersfitness.store/shop-by-sport',
      sportCategory: 'cricket'
    },
    {
      name: 'Hex Cast Iron Dumbbells (Pair - 15kg)',
      price: '£65.00',
      rating: 4.8,
      tag: 'Best Seller',
      category: 'Gym',
      iconName: 'dumbbell',
      buyUrl: 'https://highlandersfitness.store/shop-by-sport',
      sportCategory: 'fitness'
    },
    {
      name: 'Heavy Duty Multi-Resistance Bands Set',
      price: '£15.00',
      rating: 4.7,
      tag: 'Essential',
      category: 'Fitness',
      iconName: 'band',
      buyUrl: 'https://highlandersfitness.store/shop-by-sport',
      sportCategory: 'fitness'
    },
    {
      name: 'Highlanders Premium Training Sparring Gloves',
      price: '£45.00',
      rating: 5.0,
      tag: 'Professional',
      category: 'Martial Arts',
      iconName: 'gloves',
      buyUrl: 'https://highlandersfitness.store/shop-by-sport',
      sportCategory: 'combat'
    },
    {
      name: 'WT Approved Reversible Chest Protector',
      price: '£28.00',
      rating: 4.9,
      tag: 'WT approved',
      category: 'Taekwondo',
      iconName: 'guard',
      buyUrl: 'https://highlandersfitness.store/shop-by-sport',
      sportCategory: 'combat'
    },
    {
      name: 'FIFA Quality Match Training Football',
      price: '£25.00',
      rating: 4.8,
      tag: 'Match-ready',
      category: 'Football',
      iconName: 'ball',
      buyUrl: 'https://highlandersfitness.store/shop-by-sport',
      sportCategory: 'football'
    },
    {
      name: 'Agility Speed Hurdles Set (Set of 6)',
      price: '£18.00',
      rating: 4.6,
      tag: 'Speed training',
      category: 'Accessories',
      iconName: 'hurdle',
      buyUrl: 'https://highlandersfitness.store/shop-by-sport',
      sportCategory: 'football'
    }
  ];

  const benefits = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-primary-sunset" />,
      title: 'Premium Quality Standards',
      description: 'Equipment tested, curated, and approved by professional athletes.'
    },
    {
      icon: <Truck className="w-5 h-5 text-primary-wave" />,
      title: 'UK & International Delivery',
      description: 'Reliable worldwide shipping and fast local distribution.'
    },
    {
      icon: <Globe className="w-5 h-5 text-primary-sunset" />,
      title: 'Unified Customer Experience',
      description: 'Owned and operated by the same team behind Highlanders Taekwondo.'
    }
  ];

  const getCategoryProducts = (catId: string): Product[] => {
    if (loading || !liveProducts || !Array.isArray(liveProducts[catId]) || liveProducts[catId].length === 0) {
      return fallbackProducts.filter(p => p.sportCategory === catId);
    }

    const filtered = liveProducts[catId];

    return filtered.slice(0, 2).map((p: any, idx: number) => {
      const name = p.models && p.models.length > 0 
        ? `${p.brand?.name || ''} ${p.models[0]}` 
        : `${p.brand?.name || ''} ${p.equipment?.name || 'Equipment'}`;
      
      const imageUrl = p.signedImageUrl || null;

      let iconName = 'bat';
      const eqName = p.equipment?.name?.toLowerCase() || '';
      if (eqName.includes('dumbbell') || eqName.includes('barbell') || eqName.includes('weight') || eqName.includes('bench')) iconName = 'dumbbell';
      else if (eqName.includes('glove') && catId === 'combat') iconName = 'gloves';
      else if (eqName.includes('glove') && catId === 'cricket') iconName = 'glove';
      else if (eqName.includes('guard') || eqName.includes('protect')) iconName = 'guard';
      else if (eqName.includes('ball')) iconName = 'ball';

      const ratingsList = [4.9, 5.0, 4.8, 4.9];
      const rating = ratingsList[idx % ratingsList.length];

      return {
        name,
        price: `£${p.price}.00`,
        rating,
        tag: p.stock > 0 ? (p.stock < 3 ? 'Low Stock' : 'In Stock') : 'Out of Stock',
        category: p.equipment?.name || p.sport?.name || 'Equipment',
        iconName,
        imageUrl,
        buyUrl: `https://highlandersfitness.store/shop-by-sport?sportId=${p.sport?._id}&productId=${p._id}`
      };
    });
  };

  const renderProductIcon = (type: string) => {
    switch (type) {
      case 'bat':
        return (
          <svg className="w-16 h-16 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="3" x2="21" y2="6" />
            <path d="M18 3L6 15l-2 5 5-2 12-12" />
            <path d="M14 5l3 3" />
          </svg>
        );
      case 'dumbbell':
        return (
          <svg className="w-16 h-16 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="6" width="3" height="12" rx="1" />
            <rect x="19" y="6" width="3" height="12" rx="1" />
            <rect x="5" y="8" width="2" height="8" />
            <rect x="17" y="8" width="2" height="8" />
            <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2.5" />
          </svg>
        );
      case 'gloves':
      case 'glove':
        return (
          <svg className="w-16 h-16 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 18V9a4 4 0 018 0v9m-8 0a2 2 0 004 0m-4 0h8m0 0a2 2 0 002-2v-4a3 3 0 00-6 0v6" />
            <rect x="5" y="18" width="14" height="3" rx="1" />
          </svg>
        );
      case 'guard':
        return (
          <svg className="w-16 h-16 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h16l-2 11a6 6 0 01-12 0L4 4z" />
            <path d="M12 4v11" />
            <path d="M7 9h10" />
          </svg>
        );
      case 'ball':
        return (
          <svg className="w-16 h-16 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 000 20" />
            <path d="M12 2a14.5 14.5 0 010 20" />
            <path d="M2 12h20" />
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
        );
    }
  };

  const activeCategoryData = categories.find(c => c.id === activeCategory) || categories[0];
  const activeProducts = getCategoryProducts(activeCategory);

  return (
    <section id="store" className="relative py-24 bg-[#0A1128] text-white overflow-hidden scroll-mt-20">
      {/* Dynamic Background Mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-sunset/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#FF5A1F]/10 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.01] via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT PANEL: Branding, Copy, Core Benefits */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Premium Heading Accent */}
              <div className="w-12 h-1 bg-gradient-to-r from-primary-sunset to-amber-500 mb-6 rounded-full" />
              
              <h2 className="text-3xl md:text-5xl font-black font-athletic uppercase tracking-wider mb-6 leading-tight">
                Highlanders<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-sunset via-orange-400 to-amber-500">
                  Sports & Fitness
                </span>
              </h2>

              <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed font-medium">
                We design and supply elite training equipment and sports gear directly to athletes. Explore our curated collections for martial arts, cricket, football, and everyday strength fitness.
              </p>
            </motion.div>

            {/* Benefits Showcase */}
            <div className="space-y-6 mb-10">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base tracking-wide">{benefit.title}</h4>
                    <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Direct Shop Link & QR Code Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 mt-8 w-full"
            >
              <motion.a
                href="https://highlandersfitness.store/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-primary-sunset to-[#FF3E00] text-white font-bold py-4 px-8 rounded-full hover:shadow-xl hover:shadow-primary-sunset/30 transition-all duration-300 group whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Visit Store Website</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.a>

              {/* QR Code Container */}
              <div className="flex items-center space-x-4 bg-white/[0.03] border border-white/10 p-3 rounded-2xl w-full sm:w-auto shadow-inner sm:ml-auto">
                <div className="w-16 h-16 bg-white p-1.5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://highlandersfitness.store/" 
                    alt="Scan to visit Highlanders Fitness store" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black text-primary-sunset uppercase tracking-wider block">Scan to Shop</span>
                  <span className="text-xs text-gray-400 font-semibold block leading-tight mt-0.5 whitespace-nowrap">Visit store on your mobile</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT PANEL: Interactive Category Tabs & Animated Products */}
          <div className="lg:col-span-7 w-full">
            {/* Category Navigation Bar */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-8 backdrop-blur-md">
              {categories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`relative flex items-center space-x-2 px-5 py-3 rounded-xl font-bold font-athletic uppercase tracking-wider text-xs transition-all duration-300 focus:outline-none ${
                      isActive ? 'text-[#0A1128] z-10' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 rounded-xl -z-10 shadow-md"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Display Header for active Tab */}
            <div className="mb-6 pl-1">
              <span className="text-primary-sunset font-bold text-xs uppercase tracking-widest flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>FEATURED COLLECTION</span>
              </span>
              <p className="text-gray-300 text-sm mt-1">{activeCategoryData.tagline}</p>
            </div>

            {/* Product Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence mode="wait">
                {activeProducts.map((product, index) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -6 }}
                    className="group relative flex flex-col justify-between bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 shadow-lg"
                  >
                    <div>
                      {/* Product Thumbnail Placeholder */}
                      <div className="relative w-full h-40 bg-gradient-to-b from-[#0e1939] to-[#0A1128] rounded-xl flex items-center justify-center mb-5 overflow-hidden border border-white/5">
                        {/* Dynamic category gradient glow */}
                        <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl ${
                          activeCategory === 'cricket' || activeCategory === 'combat' 
                            ? 'bg-primary-sunset/30' 
                            : 'bg-amber-500/20'
                        }`} />
                        
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          renderProductIcon(product.iconName)
                        )}
                        
                        {/* Tag overlay */}
                        <div className="absolute top-3 left-3 bg-[#0A1128]/80 backdrop-blur-md px-2.5 py-1 border border-white/10 rounded-md text-[10px] font-bold text-white tracking-wider uppercase">
                          {product.tag}
                        </div>
                      </div>

                      {/* Product Metadata */}
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-wide mt-1.5 mb-2 leading-snug group-hover:text-primary-sunset transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div>
                      {/* Rating stars */}
                      <div className="flex items-center space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(product.rating) 
                                ? 'text-amber-400 fill-amber-400' 
                                : 'text-gray-600'
                            }`} 
                          />
                        ))}
                        <span className="text-[11px] text-gray-400 font-bold pl-1">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Buy action bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-lg font-black text-white font-athletic">
                          {product.price}
                        </span>
                        
                        <a
                          href={product.buyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-bold text-amber-500 hover:text-white transition-colors group/link"
                        >
                          <span>Buy Now</span>
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default StoreSection;
