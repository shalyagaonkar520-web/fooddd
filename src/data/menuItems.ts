import { Product } from '../types';

export const MENU_ITEMS: Product[] = [
  {
    id: 'party-1',
    name: 'Mintoo Mega Feast Box',
    price: 899,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    description: 'Ultimate party box with 2 Chicken Biryanis, 1 Chicken Starter, 2 Butter Naan, Veg Gravy, and 4 Mango Milkshakes!',
    isTopPick: true,
    fires: 3,
    isVeg: false
  },
  {
    id: 'party-2',
    name: 'Royal Kebab Platter (Family Pack)',
    price: 649,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
    description: 'Special assortment of 12 pcs of grilled chicken seekh kebabs, hariyali tikka, and chicken tandoori.',
    isTopPick: true,
    fires: 2,
    isVeg: false
  },
  {
    id: 'party-3',
    name: 'Veggie Delight Combo Box',
    price: 549,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80',
    description: 'Special party box containing Paneer Tikka, Veg Fried Rice, Gobi Manchurian, and 3 Coke Bottles.',
    isTopPick: true,
    fires: 2,
    isVeg: true
  },
  {
    id: 'party-4',
    name: 'Moms Special Sweet Box (Family)',
    price: 299,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
    description: 'Family dessert box with hot Gulab Jamun (8 pcs) and delicious double ka meetha.',
    isTopPick: false,
    fires: 1,
    isVeg: true
  },

  // 🍟 FAST FOOD / SNACKS
  {
    id: 'ff-1',
    name: 'Masala Papad',
    price: 69,
    category: 'Fast Food',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1630409351217-8beea4e5e774?w=800&q=80',
    description: 'Crispy papad topped with spicy onion, tomato, and masala mix.',
    isTopPick: false,
    fires: 1,
    isVeg: true
  },
  {
    id: 'ff-2',
    name: 'Shawarma',
    price: 99,
    category: 'Fast Food',
    type: 'food',
    image: '/shawarma_new.png',
    description: 'Juicy roasted meat wrapped in soft pita with garlic sauce.',
    isTopPick: false,
    fires: 1,
    isVeg: false
  },
  {
    id: 'ff-3',
    name: 'Kheema Pav',
    price: 40,
    category: 'Fast Food',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    description: 'Spicy minced meat served with buttered pav buns.',
    fires: 0,
    isVeg: false
  },


  // 🍜 RICE & NOODLES
  {
    id: 'rn-1',
    name: 'Veg Noodles',
    price: 100,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/veg_noodles_real.png',
    description: 'Stir-fried noodles with fresh garden vegetables.',
    isTopPick: false,
    fires: 2,
    isVeg: true
  },
  {
    id: 'rn-2',
    name: 'Veg Schezwan Rice',
    price: 150,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/veg_schezwan_rice.png',
    description: 'Spicy and flavorful rice tossed in Schezwan sauce.',
    isTopPick: false,
    fires: 3,
    isVeg: true
  },
  {
    id: 'rn-3',
    name: 'Gobi Manchurian',
    price: 109,
    category: 'Rice & Noodles',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1645177628172-a5b92fb99e6e?w=800&q=80',
    description: 'Crispy cauliflower florets in tangy Manchurian sauce.',
    isTopPick: false,
    fires: 1,
    isVeg: true
  },
  {
    id: 'rn-4',
    name: 'Veg Fried Rice',
    price: 129,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/veg_fried_rice.png',
    fires: 0,
    isVeg: true
  },
  {
    id: 'rn-5',
    name: 'Egg Fried Rice',
    price: 129,
    category: 'Rice & Noodles',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    fires: 0,
    isVeg: false
  },
  {
    id: 'rn-6',
    name: 'Chicken Noodles',
    price: 149,
    category: 'Rice & Noodles',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
    fires: 0,
    isVeg: false
  },
  {
    id: 'rn-7',
    name: 'Chicken Fried Rice',
    price: 149,
    category: 'Rice & Noodles',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    fires: 0,
    isVeg: false
  },
  {
    id: 'rn-8',
    name: 'Gobi Chilli',
    price: 149,
    category: 'Rice & Noodles',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1645177628172-a5b92fb99e6e?w=800&q=80',
    fires: 1,
    isVeg: true
  },
  {
    id: 'rn-9',
    name: 'Veg Pulav',
    price: 159,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/veg_pulav.png',
    fires: 1,
    isVeg: true
  },
  {
    id: 'rn-10',
    name: 'Schezwan Egg Rice',
    price: 159,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/schezwan_egg_rice.png',
    fires: 0,
    isVeg: false
  },
  {
    id: 'rn-11',
    name: 'Mutton Fried Rice',
    price: 200,
    category: 'Rice & Noodles',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1633945274405-b4693f0c45aa?w=800&q=80',
    description: 'Fragrant basmati rice stir-fried with tender mutton chunks, fresh vegetables, and aromatic spices.',
    isTopPick: true,
    fires: 2,
    isVeg: false
  },
  {
    id: 'rn-12',
    name: 'Schezwan Mutton Rice',
    price: 240,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/schezwan_mutton_rice.png',
    description: 'A spicy and bold fusion of rice, tender mutton, and fiery Schezwan sauce.',
    isTopPick: true,
    fires: 3,
    isVeg: false
  },
  {
    id: 'rn-13',
    name: 'Hakka Noodles',
    price: 139,
    category: 'Rice & Noodles',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
    fires: 1,
    isVeg: true
  },
  {
    id: 'rn-14',
    name: 'Triple Schezwan Rice',
    price: 220,
    category: 'Rice & Noodles',
    type: 'food',
    image: '/triple_schezwan_rice.png',
    fires: 3,
    isVeg: false
  },

  // 🍛 BIRYANI
  {
    id: 'br-1',
    name: 'Kushka',
    price: 99,
    category: 'Biryani',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    description: 'Plain aromatic biryani rice served with raita.',
    fires: 1,
    isVeg: true
  },
  {
    id: 'br-2',
    name: 'Egg Biryani',
    price: 149,
    category: 'Biryani',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
    description: 'Biryani rice served with boiled eggs and spices.',
    isTopPick: true,
    fires: 1,
    isVeg: false
  },
  {
    id: 'br-4',
    name: 'Veg Biryani',
    price: 139,
    category: 'Biryani',
    type: 'food',
    image: '/veg_biryani.png',
    fires: 1,
    isVeg: true
  },
  {
    id: 'br-5',
    name: 'Chicken Biryani Half',
    price: 129,
    category: 'Biryani',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    isTopPick: true,
    fires: 5,
    rating: 5.0,
    isVeg: false
  },
  {
    id: 'br-5-full',
    name: 'Chicken Biryani Full',
    price: 179,
    category: 'Biryani',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    isTopPick: true,
    fires: 5,
    rating: 5.0,
    isVeg: false
  },
  {
    id: 'br-6',
    name: 'Mutton Biryani Half',
    price: 179,
    category: 'Biryani',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1633945274405-b4693f0c45aa?w=800&q=80',
    fires: 0
,  
    isVeg: false},
  {
    id: 'br-7',
    name: 'Paneer Biryani',
    price: 190,
    category: 'Biryani',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80',
    fires: 1
,  
    isVeg: true},
  {
    id: 'br-8',
    name: 'Mutton Biryani Special',
    price: 280,
    category: 'Biryani',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
    fires: 1
,  
    isVeg: false},

  // 🍖 MUTTON
  {
    id: 'mt-1',
    name: 'Mutton Sukka',
    price: 249,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    description: 'Dry mutton roast with authentic South Indian spices and coconut.',
    isTopPick: true,
    fires: 2,
    isVeg: false
  },

  // 🍗 STARTERS
  {
    id: 'st-1',
    name: 'Chicken Crispy',
    price: 220,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
    description: 'Ultra-crispy chicken strips with a tangy glaze.',
    isTopPick: true,
    fires: 3
,  
    isVeg: false},
  {
    id: 'st-2',
    name: 'Chicken 65',
    price: 200,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80',
    description: 'Spicy, deep-fried chicken pieces from South India.',
    isTopPick: true,
    fires: 1
,  
    isVeg: false},
  {
    id: 'st-3',
    name: 'Chicken Kabab (12 Pcs)',
    price: 180,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    description: 'Succulent grilled chicken marinated in aromatic spices.',
    isTopPick: true,
    fires: 1
,  
    isVeg: false},
  {
    id: 'st-4',
    name: 'Chicken Lollipop',
    price: 209,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
    fires: 0
,  
    isVeg: false},
  {
    id: 'st-5',
    name: 'Chicken Tikka',
    price: 220,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    fires: 1
,  
    isVeg: false},
  {
    id: 'st-6',
    name: 'Chicken 65 Chinese',
    price: 240,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80',
    fires: 1
,  
    isVeg: false},
  {
    id: 'st-7',
    name: 'Chicken Kabab Half (6 Pcs)',
    price: 119,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    fires: 0
,  
    isVeg: false},
  {
    id: 'st-8',
    name: 'Fish Fry',
    price: 250,
    category: 'Starters',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=800&q=80',
    fires: 1,
    isVeg: false
  },

  // 🥦 VEG / GRAVY
  {
    id: 'vg-1',
    name: 'Veg Kolhapuri',
    price: 200,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    description: 'Spicy mixed vegetable curry from Kolhapur.',
    isTopPick: true,
    fires: 1
,  
    isVeg: true},
  {
    id: 'vg-2',
    name: 'Palak Paneer',
    price: 200,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    description: 'Soft paneer cubes in a creamy spinach gravy.',
    isTopPick: true,
    fires: 1
,  
    isVeg: true},

  {
    id: 'vg-4',
    name: 'Veg Kadai',
    price: 229,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    fires: 0
,  
    isVeg: true},
  {
    id: 'vg-5',
    name: 'Veg Korma',
    price: 229,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=800&q=80',
    fires: 0
,  
    isVeg: true},
  {
    id: 'vg-6',
    name: 'Paneer Masala',
    price: 229,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    fires: 0
,  
    isVeg: true},
  {
    id: 'vg-7',
    name: 'Kaju Masala',
    price: 250,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    fires: 1
,  
    isVeg: true},
  {
    id: 'vg-8',
    name: 'Paneer Butter Masala',
    price: 299,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80',
    fires: 1
,  
    isVeg: true},
  {
    id: 'vg-9',
    name: 'Dal Tadka',
    price: 150,
    category: 'Veg / Gravy',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    fires: 1
,  
    isVeg: true},

  // 🍞 ROTI
  {
    id: 'rt-1',
    name: '4 Chapati',
    price: 49,
    category: 'Roti',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    description: 'Soft whole wheat flatbread.',
    isTopPick: true,
    fires: 0
,  
    isVeg: true},
  {
    id: 'rt-2',
    name: '2 Parota',
    price: 39,
    category: 'Roti',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1600628421060-f685e4e69e72?w=800&q=80',
    description: 'Layered and flaky flatbread.',
    isTopPick: true,
    fires: 0
,  
    isVeg: true},
  {
    id: 'rt-3',
    name: 'Butter Roti',
    price: 29,
    category: 'Roti',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1600628421060-f685e4e69e72?w=800&q=80',
    description: 'Flaky parota topped with melting butter.',
    isTopPick: true,
    fires: 0
,  
    isVeg: true},
  {
    id: 'rt-4',
    name: '2 Tandoori Roti',
    price: 49,
    category: 'Roti',
    type: 'food',
    image: '/tandoor_roti_real.png',
    description: 'Clay oven baked flatbread.',
    isTopPick: true,
    fires: 0
,  
    isVeg: true},
  {
    id: 'rt-6',
    name: '2 Butter Roti',
    price: 59,
    category: 'Roti',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    fires: 0
,  
    isVeg: true},
  {
    id: 'rt-7',
    name: 'Butter Naan',
    price: 60,
    category: 'Roti',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    fires: 0
,  
    isVeg: true},
  {
    id: 'rt-8',
    name: 'Butter Kulcha',
    price: 65,
    category: 'Roti',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    fires: 0
,  
    isVeg: true},

  // 🍔 BURGERS & ROLLS
  {
    id: 'main-1',
    name: 'Chicken Burger',
    price: 54,
    originalPrice: 79,
    category: 'Burgers & Rolls',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80',
    description: 'Crispy fried chicken patty layered with fresh lettuce and creamy mayo.',
    fires: 1
,  
    isVeg: false},
  {
    id: 'main-2',
    name: 'Chicken Roll',
    price: 103,
    category: 'Burgers & Rolls',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
    description: 'Juicy chicken filling wrapped in soft roti with spicy sauces.',
    fires: 1
,  
    isVeg: false},
  {
    id: 'main-3',
    name: 'French Fries',
    price: 74,
    category: 'Burgers & Rolls',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80',
    fires: 1
,  
    isVeg: true},

  {
    id: 'main-6',
    name: 'Burger Loaded',
    price: 173,
    category: 'Burgers & Rolls',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    description: 'Loaded burger with double chicken, cheese, and rich sauces.',
    fires: 2
,  
    isVeg: false},
  {
    id: 'main-7',
    name: 'Veg Burger',
    price: 94,
    category: 'Burgers & Rolls',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80',
    fires: 0
,  
    isVeg: true},


  // 🍕 PIZZAS & MOMOS
  {
    id: 'piz-1',
    name: 'Chicken Pizza',
    price: 243,
    category: 'Pizzas & Momos',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    fires: 2
,  
    isVeg: false},
  {
    id: 'piz-2',
    name: 'Cheese Pizza',
    price: 223,
    category: 'Pizzas & Momos',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&q=80',
    fires: 1
,  
    isVeg: true},
  {
    id: 'piz-3',
    name: 'Veg Pizza',
    price: 203,
    category: 'Pizzas & Momos',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    fires: 1
,  
    isVeg: true},
  {
    id: 'momo-1',
    name: 'Fried Momos 12 Pc',
    price: 263,
    category: 'Pizzas & Momos',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    fires: 1
,  
    isVeg: false},
  {
    id: 'momo-2',
    name: 'Steamed Momos 12 Pc',
    price: 263,
    category: 'Pizzas & Momos',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    fires: 0
,  
    isVeg: false},


  {
    id: 'drink-special-2',
    name: 'Butterscotch Milkshake',
    price: 99,
    category: 'Drinks',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
    description: 'Rich butterscotch flavor blended to perfection with crunchy toppings.',
    fires: 1,
    isVeg: true
  },
  {
    id: 'drink-special-3',
    name: 'Vanilla Milkshake',
    price: 99,
    category: 'Drinks',
    type: 'food',
    image: '/vanilla_shake_user.png',
    description: 'Classic creamy vanilla milkshake made with real vanilla beans.',
    fires: 1,
    isVeg: true
  },
  
  // 🥤 SOFT DRINKS
  {
    id: 'drink-coke',
    name: 'Coke 500ml',
    price: 50,
    category: 'Drinks',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80',
    description: 'Ice-cold Coca-Cola 500ml bottle.',
    fires: 2,
    isVeg: true
  },
  {
    id: 'drink-sprite',
    name: 'Sprite 500ml',
    price: 50,
    category: 'Drinks',
    type: 'food',
    image: '/sprite_range.png',
    description: 'Refreshing Sprite 500ml bottle.',
    fires: 1,
    isVeg: true
  },


  {
    id: 'special-today',
    name: 'Mutton Fried Rice Special',
    price: 199,
    originalPrice: 299,
    category: 'Rice & Noodles',
    type: 'food',
    image: 'https://images.unsplash.com/photo-1633945274405-b4693f0c45aa?w=800&q=80',
    description: 'Special Edition! Tender mutton stir-fried with fragrant rice and secret spices. Limited time offer!',
    isTopPick: true,
    fires: 3,
    isVeg: false
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
