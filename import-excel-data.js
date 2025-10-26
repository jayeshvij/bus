import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearExistingData() {
  console.log('Clearing existing data...');

  await supabase.from('driver_locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bus_routes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', 'none');
  await supabase.from('drivers').delete().neq('id', 'none');
  await supabase.from('admins').delete().neq('id', 'none');

  console.log('Existing data cleared.');
}

async function importDatabase() {
  console.log('\nReading database.xlsx...');
  const workbook = XLSX.readFile(join(__dirname, 'database.xlsx'));

  if (workbook.SheetNames.includes('user')) {
    const userSheet = XLSX.utils.sheet_to_json(workbook.Sheets['user']);
    console.log(`Found ${userSheet.length} users`);

    for (const row of userSheet) {
      const userData = {
        id: String(row.id || '').trim(),
        password: String(row.password || '').trim(),
        name: String(row.name || '').trim(),
        assigned_route: row.assigned_route ? Number(row.assigned_route) : null,
        password_changed: row.password_changed === true || row.password_changed === 'TRUE' || row.password_changed === 'True'
      };

      if (userData.id && userData.password && userData.name) {
        const { error } = await supabase.from('users').insert(userData);
        if (error) {
          console.error(`Error inserting user ${userData.id}:`, error.message);
        } else {
          console.log(`✓ Imported user: ${userData.name}`);
        }
      }
    }
  }

  if (workbook.SheetNames.includes('driver')) {
    const driverSheet = XLSX.utils.sheet_to_json(workbook.Sheets['driver']);
    console.log(`\nFound ${driverSheet.length} drivers`);

    const driverNames = ['', 'Driver 1', 'Umesh', 'Pradeep', 'Paramesh', 'Chandru'];
    const busNumbers = ['', 'BUS-001', 'KA-01-AB-1234', 'KA-01-AB-5678', 'KA-01-AB-9012', 'KA-01-AB-3456'];

    for (let i = 0; i < driverSheet.length; i++) {
      const row = driverSheet[i];
      const driverId = String(row.id || '').trim();

      if (!driverId || !row.password) continue;

      const driverData = {
        id: driverId,
        password: String(row.password).trim(),
        name: driverId.charAt(0).toUpperCase() + driverId.slice(1),
        assigned_route: i >= 1 && i <= 4 ? i : null,
        bus_no: i >= 1 && i <= 4 ? busNumbers[i] : null
      };

      if (driverData.id && driverData.password) {
        const { error } = await supabase.from('drivers').insert(driverData);
        if (error) {
          console.error(`Error inserting driver ${driverData.id}:`, error.message);
        } else {
          console.log(`✓ Imported driver: ${driverData.name} (Route ${driverData.assigned_route || 'unassigned'})`);
        }
      }
    }
  }

  if (workbook.SheetNames.includes('admin')) {
    const adminSheet = XLSX.utils.sheet_to_json(workbook.Sheets['admin']);
    console.log(`\nFound ${adminSheet.length} admins`);

    for (const row of adminSheet) {
      const adminData = {
        id: String(row.id || '').trim(),
        password: String(row.password || '').trim(),
        name: row.name ? String(row.name).trim() : 'Admin'
      };

      if (adminData.id && adminData.password) {
        const { error } = await supabase.from('admins').insert(adminData);
        if (error) {
          console.error(`Error inserting admin ${adminData.id}:`, error.message);
        } else {
          console.log(`✓ Imported admin: ${adminData.name}`);
        }
      }
    }
  }
}

async function importBusRoutes() {
  console.log('\nReading Bus_Routes.xlsx...');
  const workbook = XLSX.readFile(join(__dirname, 'Bus_Routes.xlsx'));

  const routeSheets = ['route1', 'route2', 'route3', 'route4'];

  for (let i = 0; i < routeSheets.length; i++) {
    const sheetName = routeSheets[i];
    const routeNumber = i + 1;

    if (workbook.SheetNames.includes(sheetName)) {
      const routeSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      console.log(`\nFound ${routeSheet.length} stops for Route ${routeNumber}`);

      for (let j = 0; j < routeSheet.length; j++) {
        const row = routeSheet[j];

        const stopName = String(row['Route_1'] || row[`Route_${routeNumber}`] || row.Route || '').trim();
        const timing = String(row['Bus_Timings_1'] || row[`Bus_Timings_${routeNumber}`] || row.Timing || '').trim();
        let fareValue = String(row['Fare_1'] || row[`Fare_${routeNumber}`] || row.Fare || '0');

        fareValue = fareValue.replace(/[Rs,\s]/g, '');
        const fare = parseFloat(fareValue) || 0;

        const stopData = {
          route_number: routeNumber,
          stop_name: stopName,
          timing: timing,
          fare: fare,
          stop_order: j + 1
        };

        if (stopData.stop_name && stopData.timing && stopData.stop_name !== sheetName) {
          const { error } = await supabase.from('bus_routes').insert(stopData);
          if (error) {
            console.error(`Error inserting stop for Route ${routeNumber}:`, error.message);
          } else {
            console.log(`✓ Imported: ${stopData.stop_name} - ${stopData.timing} (₹${fare})`);
          }
        }
      }
    }
  }
}

async function main() {
  console.log('Starting Excel data import...\n');

  try {
    await clearExistingData();
    await importDatabase();
    await importBusRoutes();

    console.log('\n✅ Data import completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during import:', error);
    process.exit(1);
  }
}

main();
