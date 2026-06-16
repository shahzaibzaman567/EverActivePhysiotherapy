import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import Review from './models/Review.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const doctorsData = [
  {
    name: 'Dr. Sarah Jenkins',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400',
    experience: 8,
    specialty: 'Musculoskeletal Physiotherapist',
    bio: 'Specializes in spinal alignments, chronic back pain rehabilitation, and postural correction therapies with over 8 years of clinical experience.',
    availability: [
      {
        day: 'Monday',
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Wednesday',
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Friday',
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      },
    ],
  },
  {
    name: 'Dr. Marcus Vance',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    experience: 12,
    specialty: 'Sports Injury Specialist',
    bio: 'Dedicated to helping athletes recover from ACL tears, rotator cuff injuries, and sprains. Former head therapist for regional athletic teams.',
    availability: [
      {
        day: 'Tuesday',
        slots: ['09:30', '10:30', '11:30', '14:30', '15:30', '16:30', '17:30'],
      },
      {
        day: 'Thursday',
        slots: ['09:30', '10:30', '11:30', '14:30', '15:30', '16:30', '17:30'],
      },
      {
        day: 'Saturday',
        slots: ['09:00', '10:00', '11:00', '12:00', '13:00'],
      },
    ],
  },
  {
    name: 'Dr. Aisha Rahman',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    experience: 6,
    specialty: 'Neurological & Post-Op Recovery',
    bio: 'Specialist in stroke rehabilitation, Parkinson therapy, and post-surgery strength recovery. Focuses on motor control and balance training.',
    availability: [
      {
        day: 'Monday',
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      },
      {
        day: 'Tuesday',
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      },
      {
        day: 'Thursday',
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      },
    ],
  },
];

const reviewsData = [
  {
    name: 'Robert Miller',
    rating: 5,
    text: 'Dr. Jenkins completely resolved my 3-year history of lower back stiffness. Her posture training exercises were simple but incredibly effective. The clinic environment is so premium and relaxing!',
  },
  {
    name: 'Emily Watson',
    rating: 5,
    text: 'Recovering from my ACL surgery was a nightmare until I started working with Dr. Marcus Vance. He is extremely knowledgeable, pushes you safely, and got me back on the football pitch in record time. Highly recommended!',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Testimonial link placeholder
  },
  {
    name: 'Kabir Khan',
    rating: 5,
    text: 'Excellent facilities and very professional staff. Dr. Aisha Rahman is an absolute gem. Her neurological rehab session helped my father regain significant balance after his stroke.',
  },
  {
    name: 'Sophia Chang',
    rating: 4,
    text: 'Clean clinics, excellent scheduling, and zero waiting times. Booking an appointment online was very straightforward. I feel 80% better after only three sessions.',
  },
];

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing collections
    await Doctor.deleteMany();
    await Review.deleteMany();

    console.log('Existing Doctors and Reviews cleared...');

    // Seed Doctors
    await Doctor.insertMany(doctorsData);
    console.log(`${doctorsData.length} Doctors seeded successfully!`);

    // Seed Reviews
    await Review.insertMany(reviewsData);
    console.log(`${reviewsData.length} Reviews seeded successfully!`);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
