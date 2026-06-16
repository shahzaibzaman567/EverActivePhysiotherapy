import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from './models/Appointment.js';
import connectDB from './config/db.js';

dotenv.config();

async function run() {
  await connectDB();
  
  console.log('Clearing all appointments to ensure index can build...');
  await Appointment.deleteMany({});
  
  console.log('Syncing indexes...');
  try {
    await Appointment.syncIndexes();
    console.log('Indexes synced successfully!');
  } catch (err) {
    console.error('Failed to sync indexes:', err.message);
  }

  const indexes = await Appointment.collection.listIndexes().toArray();
  console.log('Current Indexes on Appointments collection:', JSON.stringify(indexes, null, 2));

  process.exit(0);
}

run();
