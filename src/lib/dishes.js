export const PAGE_SIZE = 6;
const dishes = [
  {
    id: "doro-wat",
    name: "Doro Wat",
    category: "Mains",
    price: 450,
    image: "/images/dishes/doro-wat.jpg",
    description: "Slow-cooked chicken stew in spiced berbere sauce, served with a boiled egg and injera.",
  },
  {
    id: "kitfo",
    name: "Kitfo",
    category: "Mains",
    price: 520,
    image: "/images/dishes/kitfo.jpg",
    description: "Minced beef seasoned with mitmita and spiced butter, served with ayib and injera.",
  },
  {
    id: "tibs",
    name: "Tibs",
    category: "Mains",
    price: 380,
    image: "/images/dishes/tibs.jpg",
    description: "Sautéed beef cubes with onion, pepper and rosemary.",
  },
  {
    id: "shiro",
    name: "Shiro",
    category: "Vegetarian",
    price: 220,
    image: "/images/dishes/shiro.jpg",
    description: "Creamy chickpea stew simmered with garlic and onion.",
  },
  {
    id: "beyaynetu",
    name: "Beyaynetu",
    category: "Vegetarian",
    price: 300,
    image: "/images/dishes/beyaynetu.jpg",
    description: "A fasting platter of lentils, greens, split peas and salad on injera.",
  },
  {
    id: "sambusa",
    name: "Sambusa",
    category: "Snacks",
    price: 60,
    image: "/images/dishes/sambusa.jpg",
    description: "Crisp pastry triangles filled with spiced lentils. Two pieces.",
  },
  {
    id: "buna",
    name: "Buna",
    category: "Drinks",
    price: 40,
    image: "/images/dishes/buna.jpg",
    description: "Traditional Ethiopian coffee, roasted and brewed fresh.",
  },
  {
    id: "spris",
    name: "Spris",
    category: "Drinks",
    price: 70,
    image: "/images/dishes/spris.jpg",
    description: "Layered avocado and mango juice with a squeeze of lime.",
  },
];

// Used only by the demo-order seed (src/lib/seed.js), which needs the menu synchronously.
export const DEMO_SEED_DISHES = dishes;

// Async on purpose: swapping this for a real database later changes only this file.
export async function getDishes() {
  return dishes;
}

export async function getSpecials() {
  return dishes.slice(0, 3);
}

export async function getDish(id) {
  return dishes.find((dish) => dish.id === id) ?? null;
}

export async function getCategories() {
  return [...new Set(dishes.map((dish) => dish.category))];
}