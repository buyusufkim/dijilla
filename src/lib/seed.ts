import { supabase } from '../supabase';

export const seedDemoData = async (userId: string) => {
  try {
    // Check if vehicles already exist
    const { data: existingVehicles } = await supabase.from('vehicles').select('id').eq('user_id', userId);
    if (existingVehicles && existingVehicles.length > 0) return; // Already seeded

    // 1. Insert Vehicles
    const { data: vehicles, error: vError } = await supabase.from('vehicles').insert([
      {
        user_id: userId,
        plate: '34 ABC 123',
        brand: 'Tesla',
        model: 'Model Y',
        year: 2023,
        fuel_type: 'Elektrik',
        insurance_expiry: '2026-10-15',
        inspection_expiry: '2026-12-01',
        tax_status: 'Ödendi'
      },
      {
        user_id: userId,
        plate: '06 XYZ 789',
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2021,
        fuel_type: 'Benzin',
        insurance_expiry: '2026-05-20',
        inspection_expiry: '2026-08-10',
        tax_status: 'Ödendi'
      }
    ]).select();

    if (vError || !vehicles) {
      console.error("Error seeding vehicles:", vError);
      return;
    }

    const teslaId = vehicles[0].id;
    const golfId = vehicles[1].id;

    // 2. Insert Maintenance Records
    await supabase.from('maintenance_records').insert([
      {
        user_id: userId,
        vehicle_id: teslaId,
        service_type: 'Periyodik Bakım',
        mileage: 15000,
        date: '2025-11-10',
        cost: 3500,
        notes: 'Polen filtresi değişti, genel kontrol yapıldı.'
      },
      {
        user_id: userId,
        vehicle_id: golfId,
        service_type: 'Yağ Değişimi',
        mileage: 45000,
        date: '2025-09-05',
        cost: 2200,
        notes: 'Motor yağı ve yağ filtresi değişti.'
      }
    ]);

    // 3. Insert Appointments
    await supabase.from('appointments').insert([
      {
        user_id: userId,
        vehicle_id: teslaId,
        service_type: 'Kış Lastiği Değişimi',
        appointment_date: '2026-11-15T09:00:00Z',
        location: 'Tesla Maslak Servis',
        status: 'pending'
      }
    ]);

    // 4. Insert Insurance Policies
    await supabase.from('insurance_policies').insert([
      {
        user_id: userId,
        vehicle_id: teslaId,
        type: 'Kasko',
        provider: 'Allianz Sigorta',
        policy_number: 'ALZ-2026-12345',
        start_date: '2025-10-15',
        end_date: '2026-10-15',
        premium: 15000,
        status: 'active'
      },
      {
        user_id: userId,
        vehicle_id: golfId,
        type: 'Trafik Sigortası',
        provider: 'Anadolu Sigorta',
        policy_number: 'AND-2026-98765',
        start_date: '2025-05-20',
        end_date: '2026-05-20',
        premium: 4500,
        status: 'active'
      }
    ]);

    // 5. Insert Expenses
    await supabase.from('expenses').insert([
      {
        user_id: userId,
        vehicle_id: teslaId,
        category: 'Şarj',
        amount: 450,
        date: '2026-04-01',
        description: 'ZES Hızlı Şarj'
      },
      {
        user_id: userId,
        vehicle_id: golfId,
        category: 'Yakıt',
        amount: 1200,
        date: '2026-04-02',
        description: 'Shell V-Power'
      },
      {
        user_id: userId,
        vehicle_id: teslaId,
        category: 'Yıkama',
        amount: 250,
        date: '2026-04-03',
        description: 'İç-Dış Yıkama'
      }
    ]);

    console.log("Demo verileri başarıyla yüklendi!");
  } catch (error) {
    console.error("Demo verileri yüklenirken hata oluştu:", error);
  }
};
