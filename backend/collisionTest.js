import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- Starting Concurrent Booking Collision Test ---');

  const timestamp = Date.now();
  const userAEmail = `usera_${timestamp}@test.com`;
  const userBEmail = `userb_${timestamp}@test.com`;
  const password = 'Password123!';

  try {
    // 1. Sign up User A
    console.log(`Registering User A: ${userAEmail}...`);
    const signupARes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: userAEmail, password }),
    });
    const dataA = await signupARes.json();
    if (!signupARes.ok) throw new Error(dataA.message || 'User A signup failed');
    const tokenA = dataA.token;
    console.log('User A registered successfully!');

    // 2. Sign up User B
    console.log(`Registering User B: ${userBEmail}...`);
    const signupBRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: userBEmail, password }),
    });
    const dataB = await signupBRes.json();
    if (!signupBRes.ok) throw new Error(dataB.message || 'User B signup failed');
    const tokenB = dataB.token;
    console.log('User B registered successfully!');

    // 3. Get Doctor List to retrieve a valid doctor ID
    console.log('Fetching doctors list...');
    const doctorsRes = await fetch(`${BASE_URL}/doctors`);
    const doctorsData = await doctorsRes.json();
    const doctors = doctorsData.data;
    if (!doctors || doctors.length === 0) {
      throw new Error('No doctors found in the database. Please run npm run seed first.');
    }
    const doctor = doctors[0];
    console.log(`Using Doctor: ${doctor.name} (ID: ${doctor._id})`);

    // Find a valid day and slot from availability
    const avail = doctor.availability.find(a => a.slots && a.slots.length > 0);
    if (!avail) {
      throw new Error('Selected doctor has no available slots.');
    }
    
    // Calculate a date that matches this day of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIdx = daysOfWeek.indexOf(avail.day);
    
    const d = new Date();
    // Move to next matching day of week
    while (d.getDay() !== targetDayIdx) {
      d.setDate(d.getDate() + 1);
    }
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const slotStr = avail.slots[0];

    console.log(`Targeting Date: ${dateStr}, Slot: ${slotStr}`);

    // 4. Send concurrent booking requests
    console.log('Sending concurrent booking requests from User A and User B...');
    
    const requestA = fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ doctorId: doctor._id, date: dateStr, slot: slotStr })
    });

    const requestB = fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ doctorId: doctor._id, date: dateStr, slot: slotStr })
    });

    const results = await Promise.allSettled([requestA, requestB]);

    let successCount = 0;
    let failureCount = 0;
    let conflictErrorCaught = false;

    for (let idx = 0; idx < results.length; idx++) {
      const result = results[idx];
      const user = idx === 0 ? 'User A' : 'User B';
      
      if (result.status === 'fulfilled') {
        const response = result.value;
        const resBody = await response.json();
        
        if (response.ok) {
          console.log(`✅ [SUCCESS] ${user} successfully booked the slot.`);
          successCount++;
        } else {
          console.log(`❌ [FAILED] ${user} booking failed with status: ${response.status} - ${resBody.message}`);
          if (response.status === 409 || response.status === 500) {
            conflictErrorCaught = true;
          }
          failureCount++;
        }
      } else {
        console.log(`❌ [ERROR] ${user} request network failure: ${result.reason.message}`);
        failureCount++;
      }
    }

    console.log('\n--- Collision Test Results Summary ---');
    console.log(`Successful Bookings: ${successCount}`);
    console.log(`Failed Bookings: ${failureCount}`);
    
    if (successCount === 1 && failureCount === 1 && conflictErrorCaught) {
      console.log('\n⭐⭐⭐⭐⭐ SUCCESS: Double booking was prevented correctly! Concurrent safety is OPERATIONAL. ⭐⭐⭐⭐⭐');
    } else {
      console.log('\n⚠️ WARNING: Collision protection check did not behave as expected. Please check DB unique indexes.');
    }

  } catch (error) {
    console.error('Test Execution Failed:', error.message);
  }
}

runTest();
