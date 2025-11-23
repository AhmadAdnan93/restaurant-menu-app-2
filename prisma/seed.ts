import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.rating.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.restaurant.deleteMany()

  // Create Restaurant 1: Italian Restaurant
  const italianRestaurant = await prisma.restaurant.create({
    data: {
      name: "Mario's Italian Kitchen",
      slug: "marios-italian-kitchen",
      description: "Authentic Italian cuisine with traditional recipes passed down through generations.",
      logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      categories: {
        create: [
          {
            name: "Appetizers",
            description: "Start your meal right",
            order: 1,
            menuItems: {
              create: [
                {
                  name: "Bruschetta",
                  description: "Toasted bread topped with fresh tomatoes, basil, and garlic",
                  price: 8.99,
                  image: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400",
                  order: 1,
                },
                {
                  name: "Caprese Salad",
                  description: "Fresh mozzarella, tomatoes, and basil drizzled with balsamic",
                  price: 10.99,
                  image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
                  order: 2,
                },
                {
                  name: "Antipasto Platter",
                  description: "Assorted Italian meats, cheeses, and olives",
                  price: 15.99,
                  order: 3,
                },
              ],
            },
          },
          {
            name: "Pasta",
            description: "Handmade pasta dishes",
            order: 2,
            menuItems: {
              create: [
                {
                  name: "Spaghetti Carbonara",
                  description: "Creamy pasta with bacon, eggs, and parmesan cheese",
                  price: 16.99,
                  image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
                  order: 1,
                },
                {
                  name: "Fettuccine Alfredo",
                  description: "Classic creamy alfredo sauce with parmesan",
                  price: 15.99,
                  order: 2,
                },
                {
                  name: "Linguine alle Vongole",
                  description: "Fresh clams in white wine sauce",
                  price: 19.99,
                  order: 3,
                },
              ],
            },
          },
          {
            name: "Main Courses",
            description: "Hearty Italian mains",
            order: 3,
            menuItems: {
              create: [
                {
                  name: "Chicken Parmigiana",
                  description: "Breaded chicken breast with marinara and mozzarella",
                  price: 18.99,
                  image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
                  order: 1,
                },
                {
                  name: "Veal Marsala",
                  description: "Tender veal in a rich marsala wine sauce",
                  price: 24.99,
                  order: 2,
                },
              ],
            },
          },
          {
            name: "Desserts",
            description: "Sweet endings",
            order: 4,
            menuItems: {
              create: [
                {
                  name: "Tiramisu",
                  description: "Classic Italian dessert with coffee and mascarpone",
                  price: 8.99,
                  image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
                  order: 1,
                },
                {
                  name: "Cannoli",
                  description: "Crispy shells filled with sweet ricotta",
                  price: 7.99,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
  })

  // Create Restaurant 2: Sushi Restaurant
  const sushiRestaurant = await prisma.restaurant.create({
    data: {
      name: "Tokyo Sushi Bar",
      slug: "tokyo-sushi-bar",
      description: "Fresh sushi and Japanese cuisine made with premium ingredients.",
      logo: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
      categories: {
        create: [
          {
            name: "Starters",
            description: "Begin your journey",
            order: 1,
            menuItems: {
              create: [
                {
                  name: "Edamame",
                  description: "Steamed soybeans with sea salt",
                  price: 5.99,
                  order: 1,
                },
                {
                  name: "Miso Soup",
                  description: "Traditional Japanese soup with tofu and seaweed",
                  price: 4.99,
                  order: 2,
                },
                {
                  name: "Gyoza",
                  description: "Pan-fried pork dumplings",
                  price: 7.99,
                  image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
                  order: 3,
                },
              ],
            },
          },
          {
            name: "Sushi Rolls",
            description: "Traditional and creative rolls",
            order: 2,
            menuItems: {
              create: [
                {
                  name: "California Roll",
                  description: "Crab, avocado, and cucumber",
                  price: 8.99,
                  order: 1,
                },
                {
                  name: "Dragon Roll",
                  description: "Eel, cucumber, avocado with eel sauce",
                  price: 12.99,
                  image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
                  order: 2,
                },
                {
                  name: "Spicy Tuna Roll",
                  description: "Fresh tuna with spicy mayo",
                  price: 9.99,
                  order: 3,
                },
              ],
            },
          },
          {
            name: "Nigiri",
            description: "Premium fish on rice",
            order: 3,
            menuItems: {
              create: [
                {
                  name: "Salmon Nigiri",
                  description: "Fresh Atlantic salmon",
                  price: 5.99,
                  order: 1,
                },
                {
                  name: "Tuna Nigiri",
                  description: "Premium bluefin tuna",
                  price: 6.99,
                  order: 2,
                },
                {
                  name: "Eel Nigiri",
                  description: "Grilled eel with sweet sauce",
                  price: 6.99,
                  order: 3,
                },
              ],
            },
          },
          {
            name: "Sashimi",
            description: "Fresh sliced fish",
            order: 4,
            menuItems: {
              create: [
                {
                  name: "Sashimi Platter",
                  description: "Assorted fresh fish (12 pieces)",
                  price: 24.99,
                  image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  })

  // Create Restaurant 3: Burger Joint
  const burgerRestaurant = await prisma.restaurant.create({
    data: {
      name: "Burger Palace",
      slug: "burger-palace",
      description: "Gourmet burgers made with fresh, locally sourced ingredients.",
      logo: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
      categories: {
        create: [
          {
            name: "Burgers",
            description: "Our signature burgers",
            order: 1,
            menuItems: {
              create: [
                {
                  name: "Classic Burger",
                  description: "Beef patty, lettuce, tomato, onion, pickles, special sauce",
                  price: 12.99,
                  image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
                  order: 1,
                },
                {
                  name: "BBQ Bacon Burger",
                  description: "Beef patty, cheddar, crispy bacon, onion rings, BBQ sauce",
                  price: 15.99,
                  order: 2,
                },
                {
                  name: "Veggie Burger",
                  description: "House-made vegetable patty with avocado and sprouts",
                  price: 11.99,
                  order: 3,
                },
                {
                  name: "Mushroom Swiss Burger",
                  description: "Beef patty with sautéed mushrooms and Swiss cheese",
                  price: 14.99,
                  order: 4,
                },
              ],
            },
          },
          {
            name: "Sides",
            description: "Perfect accompaniments",
            order: 2,
            menuItems: {
              create: [
                {
                  name: "French Fries",
                  description: "Crispy golden fries",
                  price: 4.99,
                  order: 1,
                },
                {
                  name: "Onion Rings",
                  description: "Beer-battered onion rings",
                  price: 5.99,
                  order: 2,
                },
                {
                  name: "Sweet Potato Fries",
                  description: "Crispy sweet potato fries",
                  price: 5.99,
                  order: 3,
                },
              ],
            },
          },
          {
            name: "Shakes & Drinks",
            description: "Cool refreshments",
            order: 3,
            menuItems: {
              create: [
                {
                  name: "Chocolate Shake",
                  description: "Rich chocolate milkshake",
                  price: 5.99,
                  order: 1,
                },
                {
                  name: "Vanilla Shake",
                  description: "Classic vanilla milkshake",
                  price: 5.99,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('✅ Created restaurants:')
  console.log(`   - ${italianRestaurant.name}`)
  console.log(`   - ${sushiRestaurant.name}`)
  console.log(`   - ${burgerRestaurant.name}`)
  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

