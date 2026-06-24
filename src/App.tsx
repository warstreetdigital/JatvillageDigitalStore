import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Battery, 
  Hammer, 
  Cpu, 
  Refrigerator, 
  Sofa, 
  ShoppingCart, 
  Send, 
  Volume2, 
  VolumeX, 
  Trash2, 
  MapPin, 
  Truck, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  Compass, 
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  QrCode,
  Building2,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from './products';
import { Product, CartItem, OrderMethod, PickupLocation, ZIMBABWE_CITIES, OrderDetails } from './types';
import { playSound, toggleMute, isSoundEnabled } from './sound';

export default function App() {
  // UI states
  const [loading, setLoading] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);
  const [soundActive, setSoundActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'solar' | 'furniture' | 'machinery'>('solar');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    PRODUCTS.find(p => p.category === 'solar') || null
  );
  
  // Live Store Activity Logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Welcome to JAT Village digital showroom...',
    'Displaying direct stock from Harare Milton Park...',
    'WhatsApp customer service lines online...',
  ]);

  // Order state
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    name: '',
    phone: '',
    method: 'pickup',
    pickupLocation: 'milton_park',
    deliveryCity: 'Harare',
    deliveryAddress: '',
    notes: '',
  });

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [whatsappString, setWhatsappString] = useState('');

  // Local Harare Time (UTC+2)
  const [harareTime, setHarareTime] = useState('');

  // Handle Harare Clock updates (UTC+2)
  useEffect(() => {
    const updateHarareTime = () => {
      const now = new Date();
      // Force Harare timezone (Africa/Harare is UTC+2)
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Africa/Harare',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        setHarareTime(formatter.format(now));
      } catch (e) {
        // Fallback to local time if timezone format fails
        setHarareTime(now.toTimeString().split(' ')[0]);
      }
    };
    
    updateHarareTime();
    const interval = setInterval(updateHarareTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate loading calibration matrix
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            // Hologram sound triggers when finished loading
            if (soundActive) {
              playSound('hologram');
            }
          }, 600);
          return 100;
        }
        
        // Add random log entries based on load percentage
        const next = prev + Math.floor(Math.random() * 15) + 5;
        const capped = Math.min(next, 100);
        
        if (capped > 20 && capped <= 40) {
          addLog('Connecting Milton Park Head Office inventory...');
        } else if (capped > 40 && capped <= 60) {
          addLog('Connecting Harare CBD Branch shop catalog...');
        } else if (capped > 60 && capped <= 80) {
          addLog('Loading solar hybrid packages & appliance compatibility...');
        } else if (capped > 80 && capped < 100) {
          addLog('Showroom data fully synced. Ready for selection.');
        }
        
        return capped;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [soundActive]);

  const addLog = (message: string) => {
    setTerminalLogs((prev) => {
      const updated = [...prev, `[${new Date().toLocaleTimeString()}] ${message}`];
      // Keep only last 6 logs
      if (updated.length > 6) {
        updated.shift();
      }
      return updated;
    });
  };

  const handleSoundToggle = () => {
    const nextState = !soundActive;
    setSoundActive(nextState);
    toggleMute(nextState);
    if (nextState) {
      setTimeout(() => {
        playSound('hologram');
      }, 50);
    }
  };

  const handleCategorySelect = (category: 'solar' | 'furniture' | 'machinery') => {
    setSelectedCategory(category);
    playSound('click');
    addLog(`Viewing department: ${category.toUpperCase()}`);
    setSelectedProduct(PRODUCTS.find((p) => p.category === category) || null);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    playSound('scanning');
    addLog(`Viewing item details: ${product.name}`);
  };

  const addToCart = (product: Product) => {
    playSound('success');
    addLog(`Added to basket: ${product.name}`);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    playSound('error');
    addLog(`Removed item from basket.`);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    playSound('click');
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'solar':
        return <Sun className="w-5 h-5 text-cyan-400" />;
      case 'furniture':
        return <Sofa className="w-5 h-5 text-amber-400" />;
      case 'machinery':
        return <Hammer className="w-5 h-5 text-red-400" />;
      default:
        return <Cpu className="w-5 h-5" />;
    }
  };

  // Compile Zimbabwe WhatsApp checkout script
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      playSound('error');
      alert('Your shopping basket is empty! Please select some products first.');
      return;
    }
    if (!orderDetails.name || !orderDetails.phone) {
      playSound('error');
      alert('Please fill in your Name and WhatsApp phone number.');
      return;
    }

    playSound('success');
    addLog('Preparing WhatsApp order details...');

    // JAT WhatsApp support contact numbers
    const phonePrimary = '263777026099'; // Standardize to international numeric format without +

    // Format highly detailed, futuristic checkout text
    let text = `🛒 *JAT VILLAGE INVESTMENTS - SHOWROOM ORDER* 🛒\n`;
    text += `===================================\n`;
    text += `🔖 *ORDER NO:* JAT-${Math.floor(Math.random() * 9000) + 1000}\n`;
    text += `👤 *CUSTOMER:* ${orderDetails.name}\n`;
    text += `📞 *PHONE:* ${orderDetails.phone}\n`;
    text += `📦 *METHOD:* ${orderDetails.method === 'pickup' ? '🛍️ STORE PICK UP' : '🚚 LOCAL DELIVERY'}\n`;
    
    if (orderDetails.method === 'pickup') {
      const loc = orderDetails.pickupLocation === 'milton_park' 
        ? 'Milton Park Head Office (25 Harvey Brown, Harare)' 
        : 'Harare CBD Branch (Shop 50 Cameron Street, Harare)';
      text += `📍 *PICKUP SPOT:* ${loc}\n`;
    } else {
      text += `📍 *DELIVERY CITY:* ${orderDetails.deliveryCity}, Zimbabwe\n`;
      text += `🏠 *STREET ADDRESS:* ${orderDetails.deliveryAddress}\n`;
    }

    if (orderDetails.notes) {
      text += `📝 *SPECIAL REQUESTS:* ${orderDetails.notes}\n`;
    }

    text += `===================================\n`;
    text += `🛍️ *SELECTED ITEMS:* \n`;

    cart.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}* \n`;
      text += `   ↳ Qty: ${item.quantity} × Price: $${item.product.price} USD\n`;
      text += `   ↳ Subtotal: *$${item.product.price * item.quantity} USD*\n`;
    });

    text += `===================================\n`;
    text += `💰 *TOTAL AMOUNT:* *$${getCartTotal()} USD*\n`;
    text += `-----------------------------------\n`;
    text += `🇿🇼 _Order sent via JAT Village Digital Showroom. Thank you for your business!_`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phonePrimary}?text=${encodedText}`;
    
    setWhatsappString(whatsappUrl);
    setOrderSubmitted(true);
    addLog('Order prepared! Tap the green button to send via WhatsApp.');
  };

  return (
    <div className="min-h-screen grid-bg text-slate-800 font-sans selection:bg-cyan-200 selection:text-slate-900 relative flex flex-col">
      
      {/* BACKGROUND SCI-FI AMBIENT VECTORS */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      {/* LOADING CALIBRATION OVERLAY (PORTAL SCANNING EFFECT) */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            id="jat-loader"
            className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-6 text-center"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 grid-bg" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500/60 animate-scanning shadow-[0_2px_8px_rgba(6,182,212,0.3)]" />

            <div className="max-w-md w-full relative z-10 space-y-8 p-8 border border-slate-200 rounded-2xl bg-white shadow-xl">
              
              {/* Spinning circular HUD vector */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full animate-spin [animation-duration:15s]" />
                <div className="absolute inset-2 border border-dashed border-amber-500/20 rounded-full animate-spin [animation-duration:8s] [animation-direction:reverse]" />
                <div className="absolute inset-4 border border-cyan-400 rounded-full flex items-center justify-center bg-cyan-50/50">
                  <QrCode className="w-16 h-16 text-cyan-600 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="font-orbitron text-2xl font-bold tracking-widest text-cyan-600 uppercase">
                  JAT VILLAGE
                </h1>
                <p className="font-rajdhani text-sm text-slate-500 tracking-wider">
                  FUTURISTIC DIGITAL SHOWROOM • ZIMBABWE
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full rounded-full transition-all duration-150 shadow-[0_1px_4px_rgba(6,182,212,0.3)]"
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-xs text-slate-500">
                  <span>STATUS: LOADING DIGITAL SHOWROOM</span>
                  <span className="text-cyan-600 font-bold">{loadPercent}%</span>
                </div>
              </div>

              {/* Loader controls */}
              <div className="pt-2">
                <button
                  id="btn-enable-audio-loader"
                  onClick={handleSoundToggle}
                  className={`px-4 py-2 rounded font-rajdhani text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-2 mx-auto uppercase border cursor-pointer ${
                    soundActive 
                      ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {soundActive ? <Volume2 className="w-4 h-4 text-cyan-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  {soundActive ? 'TOUCH SOUNDS ON' : 'ENABLE TOUCH SOUND EFFECTS'}
                </button>
                <p className="text-[10px] text-slate-400 font-mono mt-2">
                  Highly recommended for an interactive shopping experience.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN DIGITAL INTERFACE */}
      <header id="jat-header" className="border-b border-slate-200 bg-white/95 sticky top-0 z-40 px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Left info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-cyan-200 flex items-center justify-center bg-cyan-50/80 shadow-sm">
              <QrCode className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-amber-600">
                  JAT VILLAGE
                </span>
                <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 text-[9px] font-mono px-1.5 py-0.5 rounded tracking-widest uppercase">
                  QR SHOWROOM
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-rajdhani">
                ⚡ INTERACTIVE STORE CONNECTED NATIONWIDE
              </p>
            </div>
          </div>

          {/* Center stats */}
          <div className="hidden lg:flex items-center gap-6 font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-lg shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">STORE STATUS:</span>
              <span className="text-emerald-600 font-semibold">OPEN</span>
            </div>
            <div className="w-[1px] h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-slate-400">SYSTEM SPEED:</span>
              <span className="text-cyan-600 font-bold">FAST</span>
            </div>
            <div className="w-[1px] h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-400">HEAD OFFICE:</span>
              <span className="text-amber-600 font-semibold">MILTON PARK</span>
            </div>
          </div>

          {/* Right Clock and Mute Toggle */}
          <div className="flex items-center gap-4">
            
            {/* Harare Clock */}
            <div className="text-right">
              <div className="font-mono text-sm text-cyan-700 font-bold tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                {harareTime || '00:00:00'}
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-widest text-right mt-1">HARARE UTC+2</p>
            </div>

            {/* Tactile Audio Switch */}
            <button
              id="btn-header-mute"
              onClick={handleSoundToggle}
              className={`p-2 rounded-lg border transition-all cursor-pointer shadow-sm ${
                soundActive 
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-600 shadow-[0_2px_8px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-100'
              }`}
              title="Toggle touch sounds"
            >
              {soundActive ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* CENTRAL CONTROL ROOM DECK */}
      <main id="jat-viewport" className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THE GRID STORE ORBIT (8 COLS) */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* DIGITAL CATALOGUE SELECTOR */}
          <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute top-0 right-0 p-1 bg-cyan-50 text-cyan-700 text-[8px] font-mono tracking-widest rounded-bl uppercase border-l border-b border-slate-200">
              DIRECT ORDER LINE
            </div>
            
            <div className="space-y-1">
              <h2 className="font-orbitron text-sm font-bold tracking-widest text-cyan-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin [animation-duration:10s]" />
                CHOOSE A DEPARTMENT
              </h2>
              <p className="font-sans text-xs text-slate-500 leading-relaxed max-w-md">
                This digital showroom is accessible instantly via QR code banners, flyers, and billboards. Simply pick a department below to view our active items.
              </p>
            </div>

            {/* Quick Harare Hotline Buttons */}
            <div className="flex flex-wrap gap-2">
              <a 
                href="tel:+263777026099" 
                onClick={() => playSound('click')}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-600" />
                +263 777 026 099
              </a>
              <a 
                href="tel:+263713162114" 
                onClick={() => playSound('click')}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 text-slate-700 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                +263 713 162 114
              </a>
            </div>
          </div>

          {/* THREE-WAY CATEGORY SELECTION DECK */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            
            <button
              id="category-solar"
              onClick={() => handleCategorySelect('solar')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                selectedCategory === 'solar'
                  ? 'bg-cyan-50/80 border-cyan-400 text-cyan-800 shadow-[0_4px_16px_rgba(6,182,212,0.12)]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
              }`}
            >
              {selectedCategory === 'solar' && (
                <div className="absolute top-0 inset-x-0 h-1 bg-cyan-500" />
              )}
              <Sun className={`w-8 h-8 mb-2 transition-transform duration-300 group-hover:rotate-45 ${
                selectedCategory === 'solar' ? 'text-cyan-600 scale-110' : 'text-slate-400'
              }`} />
              <span className="font-orbitron text-xs sm:text-sm font-bold tracking-widest block uppercase">
                [ SOLAR DEPT ]
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block tracking-wider uppercase">
                Power Systems
              </span>
            </button>

            <button
              id="category-furniture"
              onClick={() => handleCategorySelect('furniture')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                selectedCategory === 'furniture'
                  ? 'bg-amber-50/50 border-amber-400 text-amber-800 shadow-[0_4px_16px_rgba(245,158,11,0.1)]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
              }`}
            >
              {selectedCategory === 'furniture' && (
                <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
              )}
              <Sofa className={`w-8 h-8 mb-2 transition-transform duration-300 group-hover:scale-105 ${
                selectedCategory === 'furniture' ? 'text-amber-600 scale-110' : 'text-slate-400'
              }`} />
              <span className="font-orbitron text-xs sm:text-sm font-bold tracking-widest block uppercase">
                [ HOME FURNITURE ]
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block tracking-wider uppercase">
                Sofas & Appliances
              </span>
            </button>

            <button
              id="category-machinery"
              onClick={() => handleCategorySelect('machinery')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                selectedCategory === 'machinery'
                  ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-[0_4px_16px_rgba(244,63,94,0.1)]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]'
              }`}
            >
              {selectedCategory === 'machinery' && (
                <div className="absolute top-0 inset-x-0 h-1 bg-rose-500" />
              )}
              <Hammer className={`w-8 h-8 mb-2 transition-transform duration-300 group-hover:-rotate-12 ${
                selectedCategory === 'machinery' ? 'text-rose-600 scale-110' : 'text-slate-400'
              }`} />
              <span className="font-orbitron text-xs sm:text-sm font-bold tracking-widest block uppercase">
                [ POWER & MACHINERY ]
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block tracking-wider uppercase">
                Drill Rigs & Lithium
              </span>
            </button>

          </div>

          {/* ACTIVE CATALOG ACTIVE ITEMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {PRODUCTS.filter(p => p.category === selectedCategory).map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.97, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  onClick={() => handleProductSelect(product)}
                  className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 text-left relative flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] ${
                    selectedProduct?.id === product.id 
                      ? selectedCategory === 'solar' 
                        ? 'border-cyan-400 bg-cyan-50/40 shadow-[0_4px_16px_rgba(6,182,212,0.12)]' 
                        : selectedCategory === 'furniture'
                          ? 'border-amber-400 bg-amber-50/20 shadow-[0_4px_16px_rgba(245,158,11,0.1)]'
                          : 'border-rose-400 bg-rose-50/30 shadow-[0_4px_16px_rgba(244,63,94,0.1)]'
                      : 'border-slate-200 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.03)] hover:border-slate-300'
                  }`}
                >
                  {/* Visual Indicator */}
                  <div className="absolute top-3 right-3 z-10">
                    {product.badge && (
                      <span className={`text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border uppercase ${
                        selectedCategory === 'solar' 
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200' 
                          : selectedCategory === 'furniture'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Horizontal split for image & text */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {product.image && (
                      <div className="w-full sm:w-20 sm:h-20 md:w-24 md:h-24 h-32 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50 relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        {getCategoryIcon(product.category)}
                        <span>ITEM CODE: {product.id.toUpperCase()}</span>
                      </div>
                      
                      <h3 className="font-orbitron text-sm sm:text-base font-bold text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      
                      <p className="font-sans text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Core Pricing & Basket deployment action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="font-mono">
                      <span className="text-[9px] text-slate-400 block leading-none">PRICE (USD)</span>
                      <span className="text-lg font-bold tracking-tight text-slate-800">
                        ${product.price} <span className="text-xs text-slate-500 font-medium">USD</span>
                      </span>
                    </div>

                    <button
                      id={`btn-add-${product.id}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid selecting product panel
                        addToCart(product);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-rajdhani text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 border cursor-pointer ${
                        selectedCategory === 'solar'
                          ? 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-300 hover:text-cyan-800 shadow-sm'
                          : selectedCategory === 'furniture'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800 shadow-sm'
                            : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-800 shadow-sm'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      ADD TO BASKET
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* PRODUCT SPECIFICATIONS & WARRANTY VIEWER */}
          <AnimatePresence mode="wait">
             {selectedProduct && (
                <motion.div
                  id="telemetry-view"
                  key={selectedProduct.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className={`p-6 rounded-2xl border relative overflow-hidden bg-white ${
                    selectedProduct.category === 'solar' 
                      ? 'border-cyan-200/90 shadow-[0_12px_32px_rgba(6,182,212,0.08),0_4px_12px_rgba(6,182,212,0.04)]' 
                      : selectedProduct.category === 'furniture' 
                        ? 'border-amber-200/90 shadow-[0_12px_32px_rgba(245,158,11,0.08),0_4px_12px_rgba(245,158,11,0.04)]' 
                        : 'border-rose-200/95 shadow-[0_12px_32px_rgba(244,63,94,0.08),0_4px_12px_rgba(244,63,94,0.04)]'
                  }`}
               >
                 {/* Top Accent line */}
                 <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                   selectedProduct.category === 'solar' ? 'bg-cyan-500' : selectedProduct.category === 'furniture' ? 'bg-amber-500' : 'bg-rose-500'
                 }`} />

                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                   <div>
                     <div className="font-mono text-[9px] tracking-widest text-slate-500 uppercase flex items-center gap-1">
                       <Activity className="w-3 h-3 text-cyan-600" />
                       PRODUCT TECHNICAL DETAIL
                     </div>
                     <h3 className="font-orbitron text-xl font-bold tracking-wide mt-1 text-slate-800">
                       {selectedProduct.name}
                     </h3>
                   </div>

                   <div className="font-mono text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                     <span className="text-[9px] text-slate-500 block tracking-widest">SHOWROOM PRICE</span>
                     <span className="text-2xl font-black text-cyan-700">
                       ${selectedProduct.price} <span className="text-xs text-slate-500">USD</span>
                     </span>
                   </div>
                 </div>

                 {/* Cinematic Product Image Banner */}
                 {selectedProduct.image && (
                   <div className="mb-6 rounded-xl overflow-hidden border border-slate-200/60 shadow-inner bg-slate-50 relative h-48 md:h-56">
                     <img 
                       src={selectedProduct.image} 
                       alt={selectedProduct.name}
                       referrerPolicy="no-referrer"
                       className="w-full h-full object-cover"
                     />
                     {/* Gentle overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent pointer-events-none" />
                     
                     {/* Department indicator in the corner */}
                     <div className={`absolute bottom-3 left-3 rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest text-white flex items-center gap-1.5 uppercase ${
                       selectedProduct.category === 'solar' 
                         ? 'bg-cyan-600/95 border border-cyan-500/30' 
                         : selectedProduct.category === 'furniture'
                           ? 'bg-amber-600/95 border border-amber-500/30'
                           : 'bg-rose-600/95 border border-rose-500/30'
                     }`}>
                       {getCategoryIcon(selectedProduct.category)}
                       <span>{selectedProduct.category} Department</span>
                     </div>
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   {/* Features list */}
                   <div className="space-y-3">
                     <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                       <ShieldCheck className="w-4 h-4 text-cyan-600" />
                       WHAT'S IN THE BOX & SPECIFICATIONS
                     </h4>
                     <ul className="space-y-2">
                       {selectedProduct.features.map((feature, i) => (
                         <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-sans">
                           <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                           <span>{feature}</span>
                         </li>
                       ))}
                     </ul>
                   </div>

                   {/* Powers list (Solar only) */}
                   <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                     {selectedProduct.powers ? (
                       <>
                         <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                           <Sun className="w-4 h-4 animate-spin [animation-duration:20s]" />
                           WHAT THIS SYSTEM RUNS
                         </h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {selectedProduct.powers.map((power, i) => (
                             <div key={i} className="font-mono text-[10px] text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                               <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                               <span>{power}</span>
                             </div>
                           ))}
                         </div>
                         <p className="text-[10px] text-slate-400 font-mono italic mt-2">
                           *Tested and certified for standard solar load-shedding relief conditions in Zimbabwe.
                         </p>
                       </>
                     ) : (
                       <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-2">
                         <Info className="w-8 h-8 text-slate-400" />
                         <h5 className="font-orbitron text-xs font-bold text-slate-600">QUALITY WARRANTY</h5>
                         <p className="text-[11px] text-slate-500 font-sans max-w-xs">
                           Handcrafted with extreme durability. Hardwood furniture and heavy machinery appliances designed to serve you for a lifetime.
                         </p>
                       </div>
                     )}
                   </div>

                 </div>

                 <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                   <p className="font-mono text-[10px] text-slate-400">
                     ITEM SPEC CONFORMS TO LOCAL STANDARDS || JAT VILLAGE INVESTMENTS
                   </p>
                   
                   <button
                     id={`btn-telemetry-add-${selectedProduct.id}`}
                     onClick={() => addToCart(selectedProduct)}
                     className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-bold text-sm tracking-widest rounded-lg uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                   >
                     <ShoppingCart className="w-4 h-4" />
                     ADD THIS ITEM TO BASKET
                   </button>
                 </div>

              </motion.div>
            )}
          </AnimatePresence>

        </section>

        {/* RIGHT COLUMN: THE BASKET AND DISPATCH FORM (4 COLS) */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* THE SHOPPING BASKET (CART) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.04)] space-y-4 relative">
            <div className="absolute top-4 right-5 flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              BASKET STATUS: READY
            </div>

            <h3 className="font-orbitron text-sm font-bold tracking-widest text-slate-800 flex items-center gap-2 uppercase border-b border-slate-100 pb-3">
              <ShoppingCart className="w-4 h-4 text-cyan-600" />
              YOUR SELECTED BASKET
            </h3>

            {cart.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                  Basket is Empty
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Add items from our showroom, fill in your details, and place your order instantly on WhatsApp for local delivery or quick pick-up.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {cart.map((item) => (
                  <div 
                    key={item.product.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center gap-2 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-orbitron text-xs font-bold text-slate-800 truncate max-w-[150px]">
                        {item.product.name}
                      </h4>
                      <div className="font-mono text-[10px] text-cyan-700">
                        ${item.product.price} USD <span className="text-slate-500">ea</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                        <button
                          type="button"
                          id={`btn-qty-dec-${item.product.id}`}
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          id={`btn-qty-inc-${item.product.id}`}
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        id={`btn-remove-${item.product.id}`}
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Clear and Total Module */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center font-mono">
                  <span className="text-xs text-slate-550 uppercase tracking-widest">TOTAL USD AMOUNT:</span>
                  <span className="text-lg font-bold text-cyan-700">
                    ${getCartTotal()} USD
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECURE ORDER DISPATCH (THE SECURE ORDERING PROTOCOL) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.04)] space-y-4 relative">
            
            <h3 className="font-orbitron text-sm font-bold tracking-widest text-slate-800 flex items-center gap-2 uppercase border-b border-slate-100 pb-3">
              <Send className="w-4 h-4 text-amber-600" />
              CHOOSE DELIVERY OR PICK UP
            </h3>

            {orderSubmitted ? (
              <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-cyan-600 animate-pulse" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-orbitron text-xs font-bold tracking-widest text-cyan-700 uppercase">
                    ORDER READY TO SEND
                  </h4>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Your order has been compiled! Tap the button below to send it to us on WhatsApp to confirm delivery details or pickup time.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <a
                    id="link-whatsapp-send"
                    href={whatsappString}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    onClick={() => {
                      playSound('success');
                      addLog('WhatsApp order opened successfully.');
                    }}
                    className="w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-bold text-xs tracking-widest rounded-lg uppercase transition-all shadow-md block text-center cursor-pointer"
                  >
                    SEND ORDER TO WHATSAPP 🚀
                  </a>

                  <button
                    type="button"
                    id="btn-new-transmission"
                    onClick={() => {
                      playSound('click');
                      setOrderSubmitted(false);
                    }}
                    className="w-full px-4 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono text-[10px] rounded-lg tracking-wider uppercase transition-all cursor-pointer shadow-sm"
                  >
                    EDIT MY BASKET
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-3">
                
                {/* Method Selector */}
                <div className="space-y-1.5">
                  <label className="font-orbitron text-[10px] text-slate-700 font-semibold uppercase tracking-widest block">
                    HOW DO YOU WANT IT?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                       type="button"
                       id="protocol-pickup"
                       onClick={() => {
                         playSound('click');
                         setOrderDetails(prev => ({ ...prev, method: 'pickup' }));
                       }}
                       className={`py-2 px-3 rounded-lg border font-rajdhani text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                         orderDetails.method === 'pickup'
                           ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-sm'
                           : 'bg-slate-50 border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 shadow-sm'
                       }`}
                    >
                      <Building2 className="w-3.5 h-3.5 animate-pulse" />
                      COLLECT IN STORE
                    </button>
                    <button
                       type="button"
                       id="protocol-delivery"
                       onClick={() => {
                         playSound('click');
                         setOrderDetails(prev => ({ ...prev, method: 'delivery' }));
                       }}
                       className={`py-2 px-3 rounded-lg border font-rajdhani text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                         orderDetails.method === 'delivery'
                           ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm'
                           : 'bg-slate-50 border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 shadow-sm'
                       }`}
                    >
                      <Truck className="w-3.5 h-3.5 animate-bounce" />
                      DELIVERY AT HOME
                    </button>
                  </div>
                </div>

                {/* Conditional Fields depending on retrieval protocol */}
                {orderDetails.method === 'pickup' ? (
                  <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-250 shadow-inner">
                    <label className="font-orbitron text-[9px] text-slate-700 font-bold uppercase tracking-widest block">
                      SELECT OUR NEAREST PICKUP SHOP
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer group p-1">
                        <input
                          type="radio"
                          name="pickup_loc"
                          id="pickup-milton"
                          checked={orderDetails.pickupLocation === 'milton_park'}
                          onChange={() => {
                            playSound('click');
                            setOrderDetails(prev => ({ ...prev, pickupLocation: 'milton_park' }));
                          }}
                          className="mt-1 accent-cyan-600 cursor-pointer text-cyan-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <div className="text-xs font-sans text-slate-700 group-hover:text-slate-900">
                          <span className="font-bold text-slate-900 block">Milton Park Head Office</span>
                          25 Harvey Brown, Milton Park, Harare
                        </div>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer group p-1 border-t border-slate-200/80 pt-2">
                        <input
                          type="radio"
                          name="pickup_loc"
                          id="pickup-cbd"
                          checked={orderDetails.pickupLocation === 'cbd'}
                          onChange={() => {
                            playSound('click');
                            setOrderDetails(prev => ({ ...prev, pickupLocation: 'cbd' }));
                          }}
                          className="mt-1 accent-cyan-600 cursor-pointer text-cyan-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <div className="text-xs font-sans text-slate-700 group-hover:text-slate-900">
                          <span className="font-bold text-slate-900 block">Harare CBD Branch</span>
                          Shop 50, Cameron Street, Harare CBD
                        </div>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-250 space-y-2 shadow-inner">
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-orbitron text-[9px] text-slate-700 font-bold uppercase tracking-wider block">
                          TOWN / CITY IN ZIMBABWE
                        </label>
                        <select
                          id="select-city"
                          value={orderDetails.deliveryCity}
                          onChange={(e) => {
                            playSound('click');
                            setOrderDetails(prev => ({ ...prev, deliveryCity: e.target.value }));
                          }}
                          className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-900 p-2 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {ZIMBABWE_CITIES.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="font-orbitron text-[9px] text-slate-700 font-bold uppercase tracking-wider block mt-0.5">
                          DELIVERY NOTES
                        </span>
                        <div className="text-[10px] font-mono text-slate-700 font-semibold pt-2.5">
                          ⚡ DELIVERY AT CUSTOM RATE
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-orbitron text-[9px] text-slate-700 font-bold uppercase tracking-wider block">
                        PHYSICAL DELIVERY STREET ADDRESS
                      </label>
                      <input
                        type="text"
                        id="input-address"
                        required
                        placeholder="Plot No, Street, Suburb Name"
                        value={orderDetails.deliveryAddress}
                        onChange={(e) => setOrderDetails(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                        className="w-full bg-white border border-slate-300 text-xs font-sans text-slate-900 p-2 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="font-orbitron text-[10px] text-slate-700 font-semibold uppercase tracking-widest block">
                    YOUR FULL NAME
                  </label>
                  <input
                    type="text"
                    id="input-name"
                    required
                    placeholder="e.g. Tinashe Moyo"
                    value={orderDetails.name}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-slate-300 text-xs font-sans text-slate-900 placeholder:text-slate-400 p-2.5 rounded-lg focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all shadow-sm"
                  />
                </div>

                {/* Phone Contact */}
                <div className="space-y-1">
                  <label className="font-orbitron text-[10px] text-slate-700 font-semibold uppercase tracking-widest block">
                    WHATSAPP / CONTACT PHONE
                  </label>
                  <input
                    type="tel"
                    id="input-phone"
                    required
                    placeholder="e.g. 0777026099"
                    value={orderDetails.phone}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-white border border-slate-300 text-xs font-mono text-slate-900 placeholder:text-slate-400 p-2.5 rounded-lg focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all shadow-sm"
                  />
                </div>

                {/* Special specs / Notes */}
                <div className="space-y-1">
                  <label className="font-orbitron text-[10px] text-slate-700 font-semibold uppercase tracking-widest block">
                    SPECIAL DELIVERY/PRODUCT REQUESTS
                  </label>
                  <textarea
                    id="input-notes"
                    placeholder="Preferred color of couch, special delivery times, borehole depth specs, etc..."
                    value={orderDetails.notes}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full bg-white border border-slate-300 text-xs font-sans text-slate-900 placeholder:text-slate-400 p-2.5 rounded-lg focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all shadow-sm resize-none"
                  />
                </div>

                {/* Checkout Trigger */}
                <button
                  type="submit"
                  id="btn-transmit-checkout"
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-amber-600 hover:from-cyan-500 hover:to-amber-500 text-white font-orbitron font-extrabold text-xs tracking-widest rounded-lg uppercase transition-all shadow-md cursor-pointer"
                >
                  COMPILE MY WHATSAPP ORDER
                </button>

              </form>
            )}

          </div>

        </section>

      </main>

      {/* FOOTER AND PROTOCOL SUMMARY INFO */}
      <footer id="jat-footer" className="mt-auto border-t border-slate-200 bg-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          
          <div className="space-y-1">
            <p className="font-orbitron text-xs font-bold tracking-widest text-slate-800">
              JAT VILLAGE INVESTMENTS • DIGITAL SHOWROOM
            </p>
            <p className="font-sans text-[11px] text-slate-500 max-w-xl leading-relaxed">
              Serving the entire nation of Zimbabwe with premium solar packages, handcrafted durable home furniture, emergency power, and borehole drill kinetics. Scan the billboard or flyers to transact from anywhere instantly.
            </p>
          </div>

          <div className="font-mono text-[10px] text-slate-500 space-y-1 text-center md:text-right">
            <div>📍 HEAD OFFICE: 25 Harvey Brown Milton Park, Harare</div>
            <div>📍 CBD BRANCH: Shop 50, Cameron Street, Harare CBD</div>
            <div className="text-cyan-600 font-medium">🇿🇼 DELIVERING NATIONWIDE IN ZIMBABWE</div>
          </div>

        </div>
      </footer>

    </div>
  );
}
