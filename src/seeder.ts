import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db";
import Pet from "./models/Pet";

// Load environment variables
dotenv.config();

const samplePets = [
  {
    name: "Mochi",
    species: "Cat",
    breed: "Scottish Fold",
    age: "4 months",
    gender: "Female",
    image: "https://i.pinimg.com/736x/16/1c/6f/161c6f08cbe37cbb4014a3ac5a92de97.jpg",
    healthStatus: "Perfectly healthy, very playful",
    vaccinationStatus: "Fully Vaccinated",
    location: "Dhanmondi, Dhaka",
    adoptionFee: 15,
    description: "Mochi is a tiny marshmallow who loves curling up in warm laps and making soft purring sounds. She gets along wonderfully with plush toys!",
    ownerEmail: "nursery@pawskywawsky.com"
  },
  {
    name: "Biscuit",
    species: "Dog",
    breed: "Golden Retriever",
    age: "2 months",
    gender: "Male",
    image: "https://i.pinimg.com/736x/51/7f/7a/517f7a16f5f93ecdbc5e4e274e866de7.jpg",
    healthStatus: "Healthy and energetic",
    vaccinationStatus: "First Dose Done",
    location: "Banani, Dhaka",
    adoptionFee: 25,
    description: "Biscuit is a clumsy little guy who trips over his own paws. He loves chewing on soft slippers and chasing bubbles in the yard.",
    ownerEmail: "nursery@pawskywawsky.com"
  },
  {
    name: "Pip",
    species: "Bird",
    breed: "Cockatiel",
    age: "6 months",
    gender: "Male",
    image: "https://i.pinimg.com/1200x/08/f7/c2/08f7c21d4ec7cde9bcf0068b30949159.jpg",
    healthStatus: "Excellent feather health",
    vaccinationStatus: "Not Required",
    location: "Uttara, Dhaka",
    adoptionFee: 0, // Free adoption!
    description: "Pip loves whistling little tunes, especially when he hears running water. He is completely hand-tame and enjoys sitting on shoulders.",
    ownerEmail: "nursery@pawskywawsky.com"
  },
  {
    name: "Clover",
    species: "Rabbit",
    breed: "Angora Bunny",
    age: "3 months",
    gender: "Female",
    image: "https://i.pinimg.com/736x/b2/12/95/b21295a6ee3544a07c480d272288d5d3.jpg",
    healthStatus: "Healthy, requires regular brushing",
    vaccinationStatus: "Fully Vaccinated",
    location: "Rajshahi City",
    adoptionFee: 10,
    description: "Clover is an absolute cloud of soft fur. She loves fresh mint leaves, strawberries, and soft head rubs behind her ears.",
    ownerEmail: "admin@pixelstudio.dev"
  },
  {
    name: "Peanut",
    species: "Cat",
    breed: "Ragdoll",
    age: "1 year",
    gender: "Male",
    image: "https://i.pinimg.com/736x/a9/f1/77/a9f1779158cc3f1586f6e736c03571b6.jpg",
    healthStatus: "Healthy, slight food allergy (needs specific kibble)",
    vaccinationStatus: "Fully Vaccinated",
    location: "Gulshan, Dhaka",
    adoptionFee: 20,
    description: "Peanut is a gentle giant who goes completely limp like a ragdoll when you pick him up. Super calm, lazy, and loves afternoon sun naps.",
    ownerEmail: "admin@pixelstudio.dev"
  },
  {
    name: "Waffles",
    species: "Dog",
    breed: "Pembroke Welsh Corgi",
    age: "5 months",
    gender: "Male",
    image: "https://i.pinimg.com/736x/d9/8f/84/d98f848cd623cedc704d0bc470df41dc.jpg",
    healthStatus: "Perfectly active",
    vaccinationStatus: "Fully Vaccinated",
    location: "Sylhet Sadar",
    adoptionFee: 30,
    description: "Waffles has short little legs but the biggest heart! He loves outdoor picnics and will follow you around like a little fluffy shadow.",
    ownerEmail: "waffles_owner@gmail.com"
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear out existing records so we don't duplicate them on multiple runs
    await Pet.deleteMany();
    console.log("🗑️ Existing pets cleared...");

    // Insert our 6 cozy entries
    await Pet.insertMany(samplePets);
    console.log("🐾 Success! 6 precious pet gems have been safely nestled into your database!");

    // Close database connection gracefully
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();