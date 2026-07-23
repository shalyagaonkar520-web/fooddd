import { Product } from '../types';

export const MENU_ITEMS: Product[] = [
  // 🍟 FAST FOOD (3 items)
  {
    id: 'ff-1',
    hotelId: 'hotel1@minto.com',
    name: 'Masala Papad',
    price: 69,
    category: 'Fast Food',
    type: 'food',
    image: '/masala_papad.png',
    description: 'Crispy papad topped with spicy onion, tomato, and masala mix.',
    isTopPick: false,
    fires: 1,
    isVeg: true
  },
  {
    id: 'ff-2',
    hotelId: 'hotel1@minto.com',
    name: 'Shawarma',
    price: 99,
    category: 'Fast Food',
    type: 'food',
    image: '/mini_burger_combo.jpg',
    description: 'Juicy roasted meat wrapped in soft pita with garlic sauce.',
    isTopPick: false,
    fires: 1,
    isVeg: false
  },
  {
    id: 'ff-3',
    hotelId: 'hotel1@minto.com',
    name: 'Kheema Pav',
    price: 40,
    category: 'Fast Food',
    type: 'food',
    image: '/kheema_pav.png',
    description: 'Spicy minced meat served with buttered pav buns.',
    fires: 0,
    isVeg: false
  },

  // 🍜 RICE & NOODLES (4 items)
  {
    id: 'rn-1',
    hotelId: 'hotel1@minto.com',
    name: 'Veg Noodles',
    price: 100,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/chicken_maggie.jpg',
    description: 'Stir-fried noodles with fresh garden vegetables.',
    isTopPick: false,
    fires: 2,
    isVeg: true
  },
  {
    id: 'rn-4',
    hotelId: 'hotel1@minto.com',
    name: 'Veg Fried Rice',
    price: 129,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/egg_fried_rice.png',
    fires: 0,
    isVeg: true
  },
  {
    id: 'rn-7',
    hotelId: 'hotel1@minto.com',
    name: 'Chicken Fried Rice',
    price: 149,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/chicken_fried_rice.png',
    fires: 0,
    isVeg: false
  },
  {
    id: 'rn-11',
    hotelId: 'hotel1@minto.com',
    name: 'Mutton Fried Rice',
    price: 200,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/mutton_fried_rice.png',
    description: 'Fragrant basmati rice stir-fried with tender mutton chunks, fresh vegetables, and aromatic spices.',
    isTopPick: true,
    fires: 2,
    isVeg: false
  },

  // 🍛 BIRYANI (4 items)
  {
    id: 'br-2',
    hotelId: 'hotel1@minto.com',
    name: 'Egg Biryani',
    price: 149,
    category: 'Biryani',
    type: 'food',
    image: '/egg_biryani.png',
    description: 'Biryani rice served with boiled eggs and spices.',
    isTopPick: true,
    fires: 1,
    isVeg: false
  },
  {
    id: 'br-4',
    hotelId: 'hotel1@minto.com',
    name: 'Veg Biryani',
    price: 139,
    category: 'Biryani',
    type: 'food',
    image: '/paneer_biryani.png',
    fires: 1,
    isVeg: true
  },
  {
    id: 'br-5',
    hotelId: 'hotel1@minto.com',
    name: 'Chicken Biryani Half',
    price: 129,
    category: 'Biryani',
    type: 'food',
    image: '/chicken_biryani_new.png',
    isTopPick: true,
    fires: 5,
    rating: 5.0,
    isVeg: false
  },
  {
    id: 'br-6',
    hotelId: 'hotel1@minto.com',
    name: 'Mutton Biryani Half',
    price: 179,
    category: 'Biryani',
    type: 'food',
    image: '/mutton_biryani.png',
    fires: 0,
    isVeg: false
  },

  // 🍗 STARTERS (4 items)
  {
    id: 'st-1',
    hotelId: 'hotel1@minto.com',
    name: 'Chicken Crispy',
    price: 220,
    category: 'Starters',
    type: 'food',
    image: '/chicken_crispy.png',
    description: 'Ultra-crispy chicken strips with a tangy glaze.',
    isTopPick: true,
    fires: 3,
    isVeg: false
  },
  {
    id: 'st-2',
    hotelId: 'hotel1@minto.com',
    name: 'Chicken 65',
    price: 200,
    category: 'Starters',
    type: 'food',
    image: '/chicken_65.png',
    description: 'Spicy, deep-fried chicken pieces from South India.',
    isTopPick: true,
    fires: 1,
    isVeg: false
  },
  {
    id: 'st-3',
    hotelId: 'hotel1@minto.com',
    name: 'Chicken Kabab (12 Pcs)',
    price: 180,
    category: 'Starters',
    type: 'food',
    image: '/chicken_kabab.png',
    description: 'Succulent grilled chicken marinated in aromatic spices.',
    isTopPick: true,
    fires: 1,
    isVeg: false
  },
  {
    id: 'st-8',
    hotelId: 'hotel1@minto.com',
    name: 'Fish Fry',
    price: 250,
    category: 'Starters',
    type: 'food',
    image: '/fish_fry.png',
    fires: 1,
    isVeg: false
  },

  // 🥦 VEG / GRAVY (4 items)
  {
    id: 'vg-2',
    hotelId: 'hotel1@minto.com',
    name: 'Palak Paneer',
    price: 200,
    category: 'Veg / Gravy',
    type: 'food',
    image: '/palak_paneer.jpg',
    description: 'Soft paneer cubes in a creamy spinach gravy.',
    isTopPick: true,
    fires: 1,
    isVeg: true
  },
  {
    id: 'vg-8',
    hotelId: 'hotel1@minto.com',
    name: 'Paneer Butter Masala',
    price: 299,
    category: 'Veg / Gravy',
    type: 'food',
    image: '/kaju_masala.png',
    fires: 1,
    isVeg: true
  },
  {
    id: 'vg-9',
    hotelId: 'hotel1@minto.com',
    name: 'Dal Tadka',
    price: 150,
    category: 'Veg / Gravy',
    type: 'food',
    image: '/dal_tadka.png',
    fires: 1,
    isVeg: true
  },
  {
    id: 'mt-1',
    hotelId: 'hotel1@minto.com',
    name: 'Mutton Sukka',
    price: 249,
    category: 'Veg / Gravy',
    type: 'food',
    image: '/mutton_sukka.png',
    description: 'Dry mutton roast with authentic South Indian spices and coconut.',
    isTopPick: true,
    fires: 2,
    isVeg: false
  },

  // 🍞 ROTI (4 items)
  {
    id: 'rt-1',
    hotelId: 'hotel1@minto.com',
    name: '4 Chapati',
    price: 49,
    category: 'Roti',
    type: 'food',
    image: '/chapati.jpg',
    description: 'Soft whole wheat flatbread.',
    isTopPick: true,
    fires: 0,
    isVeg: true
  },
  {
    id: 'rt-2',
    hotelId: 'hotel1@minto.com',
    name: '2 Parota',
    price: 39,
    category: 'Roti',
    type: 'food',
    image: '/butter_parota.jpg',
    description: 'Layered and flaky flatbread.',
    isTopPick: true,
    fires: 0,
    isVeg: true
  },
  {
    id: 'rt-4',
    hotelId: 'hotel1@minto.com',
    name: '2 Tandoori Roti',
    price: 49,
    category: 'Roti',
    type: 'food',
    image: '/butter_roti.png',
    description: 'Clay oven baked flatbread.',
    isTopPick: true,
    fires: 0,
    isVeg: true
  },
  {
    id: 'rt-7',
    hotelId: 'hotel1@minto.com',
    name: 'Butter Naan',
    price: 60,
    category: 'Roti',
    type: 'food',
    image: '/butter_naan.png',
    fires: 0,
    isVeg: true
  },

  // 🍔 BURGERS & ROLLS (4 items)
  {
    id: 'main-1',
    hotelId: 'hotel1@minto.com',
    name: 'Chicken Burger',
    price: 54,
    originalPrice: 79,
    category: 'Burgers & Rolls',
    type: 'food',
    image: '/mini_burger_combo.jpg',
    description: 'Crispy fried chicken patty layered with fresh lettuce and creamy mayo.',
    fires: 1,
    isVeg: false
  },
  {
    id: 'main-2',
    hotelId: 'hotel1@minto.com',
    name: 'Chicken Roll',
    price: 103,
    category: 'Burgers & Rolls',
    type: 'food',
    image: '/fried_chicken_combo.jpg',
    description: 'Juicy chicken filling wrapped in soft roti with spicy sauces.',
    fires: 1,
    isVeg: false
  },
  {
    id: 'main-3',
    hotelId: 'hotel1@minto.com',
    name: 'French Fries',
    price: 74,
    category: 'Burgers & Rolls',
    type: 'food',
    image: '/happy_meal_combo.jpg',
    fires: 1,
    isVeg: true
  },
  {
    id: 'main-6',
    hotelId: 'hotel1@minto.com',
    name: 'Burger Loaded',
    price: 173,
    category: 'Burgers & Rolls',
    type: 'food',
    image: '/mini_burger_combo.jpg',
    description: 'Loaded burger with double chicken, cheese, and rich sauces.',
    fires: 2,
    isVeg: false
  },

  // 🍕 PIZZAS & MOMOS (4 items)
  {
    id: 'piz-1',
    hotelId: 'hotel1@minto.com',
    name: 'Chicken Pizza',
    price: 243,
    category: 'Pizzas & Momos',
    type: 'food',
    image: '/paneer_cutlet.png',
    fires: 2,
    isVeg: false
  },
  {
    id: 'piz-2',
    hotelId: 'hotel1@minto.com',
    name: 'Cheese Pizza',
    price: 223,
    category: 'Pizzas & Momos',
    type: 'food',
    image: '/gobi_manchurian.png',
    fires: 1,
    isVeg: true
  },
  {
    id: 'momo-1',
    hotelId: 'hotel1@minto.com',
    name: 'Fried Momos 12 Pc',
    price: 263,
    category: 'Pizzas & Momos',
    type: 'food',
    image: '/fried_momos.png',
    fires: 1,
    isVeg: false
  },
  {
    id: 'momo-2',
    hotelId: 'hotel1@minto.com',
    name: 'Steamed Momos 12 Pc',
    price: 263,
    category: 'Pizzas & Momos',
    type: 'food',
    image: '/fried_momos.png',
    fires: 0,
    isVeg: false
  },

  // 🥤 DRINKS (4 items)
  {
    id: 'drink-special-2',
    hotelId: 'hotel1@minto.com',
    name: 'Butterscotch Milkshake',
    price: 99,
    category: 'Drinks',
    type: 'food',
    image: '/butterscotch_shake_user.png',
    description: 'Rich butterscotch flavor blended to perfection with crunchy toppings.',
    fires: 1,
    isVeg: true
  },
  {
    id: 'drink-special-3',
    hotelId: 'hotel1@minto.com',
    name: 'Vanilla Milkshake',
    price: 99,
    category: 'Drinks',
    type: 'food',
    image: '/mango_shake_user.png',
    description: 'Classic creamy vanilla milkshake made with real vanilla beans.',
    fires: 1,
    isVeg: true
  },
  {
    id: 'drink-coke',
    hotelId: 'hotel1@minto.com',
    name: 'Coke 500ml',
    price: 50,
    category: 'Drinks',
    type: 'food',
    image: '/coke_range.png',
    description: 'Ice-cold Coca-Cola 500ml bottle.',
    fires: 2,
    isVeg: true
  },
  {
    id: 'drink-sprite',
    hotelId: 'hotel1@minto.com',
    name: 'Sprite 500ml',
    price: 50,
    category: 'Drinks',
    type: 'food',
    image: '/classic_mojito.png',
    description: 'Refreshing Sprite 500ml bottle.',
    fires: 1,
    isVeg: true
  }
];

export const CATEGORIES = ['Fast Food', 'Rice & Noodles', 'Biryani', 'Starters', 'Veg / Gravy', 'Roti', 'Burgers & Rolls', 'Pizzas & Momos', 'Drinks'];

export const CATEGORY_ICONS: Record<string, { icon: string, bg: string }> = {
  'Fast Food': { icon: '🍟', bg: 'from-orange-500/20 to-amber-600/20' },
  'Rice & Noodles': { icon: '🍜', bg: 'from-yellow-400/20 to-amber-500/20' },
  'Biryani': { icon: '🍛', bg: 'from-orange-500/20 to-teal-600/20' },
  'Starters': { icon: '🍗', bg: 'from-red-500/20 to-rose-600/20' },
  'Veg / Gravy': { icon: '🥦', bg: 'from-green-500/20 to-orange-600/20' },
  'Soups': { icon: '🍲', bg: 'from-blue-500/20 to-cyan-600/20' },
  'Roti': { icon: '🍞', bg: 'from-stone-500/20 to-orange-600/20' },
  'Burgers & Rolls': { icon: '🍔', bg: 'from-orange-400/20 to-red-500/20' },
  'Drinks': { icon: '🥤', bg: 'from-blue-400/20 to-indigo-500/20' }
};

export const COMING_SOON_CATEGORIES = [
  { name: 'Grocery', icon: '🛒', bg: 'from-green-500/20 to-orange-600/20' }
];

export function getFakeOriginalPrice(price: number, originalPrice?: number): number {
  if (originalPrice) return originalPrice;
  return Math.round(price / 0.7); // 30% off
}
