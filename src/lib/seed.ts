import { db } from '@/lib/supabase-service';

export const seedDemoData = async (userId: string) => {
  try {
    // Check if vehicles already exist
    const { data: existingVehicles } = await db.from('vehicles').select('*');
    const userVehicles = existingVehicles?.filter((v: any) => v.user_id === userId) || [];
    if (userVehicles.length > 0) return; // Already seeded

    // 1. Insert Vehicles
    const vehicleData = [
      {
        user_id: userId,
        plate: '34 ABC 123',
        brand_model: 'Tesla Model Y',
        year: 2023,
        fuel_type: 'Elektrik',
        insurance_expiry: '2026-10-15',
        inspection_expiry: '2026-12-01',
        tax_status: 'Ödendi',
        created_at: new Date().toISOString()
      },
      {
        user_id: userId,
        plate: '06 XYZ 789',
        brand_model: 'Volkswagen Golf',
        year: 2021,
        fuel_type: 'Benzin',
        insurance_expiry: '2026-05-20',
        inspection_expiry: '2026-08-10',
        tax_status: 'Ödendi',
        created_at: new Date().toISOString()
      }
    ];

    const vehicles: any[] = [];
    for (const v of vehicleData) {
      const result = await db.from('vehicles').insert(v);
      // Since insert doesn't return the object in our mock, we fetch it or just use the data we have
      // In a real Supabase insert, we'd use .select().single()
      const { data: allVehicles } = await db.from('vehicles').select('*');
      const inserted = allVehicles?.find((item: any) => item.plate === v.plate && item.user_id === userId);
      vehicles.push(inserted || { id: Math.random().toString(), ...v });
    }

    const teslaId = vehicles[0].id;
    const golfId = vehicles[1].id;

    // 2. Insert Maintenance Records
    const maintenanceData = [
      {
        user_id: userId,
        vehicle_id: teslaId,
        service_type: 'Periyodik Bakım',
        mileage: 15000,
        date: '2025-11-10',
        cost: 3500,
        notes: 'Polen filtresi değişti, genel kontrol yapıldı.',
        created_at: new Date().toISOString()
      },
      {
        user_id: userId,
        vehicle_id: golfId,
        service_type: 'Yağ Değişimi',
        mileage: 45000,
        date: '2025-09-05',
        cost: 2200,
        notes: 'Motor yağı ve yağ filtresi değişti.',
        created_at: new Date().toISOString()
      }
    ];

    for (const m of maintenanceData) {
      await db.from('maintenance_records').insert(m);
    }

    // 3. Insert Appointments
    const appointmentData = [
      {
        user_id: userId,
        vehicle_id: teslaId,
        service_type: 'Kış Lastiği Değişimi',
        appointment_date: '2026-11-15T09:00:00Z',
        location: 'Tesla Maslak Servis',
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
    ];

    for (const a of appointmentData) {
      await db.from('appointments').insert(a);
    }

    // 4. Insert Expenses
    const expenseData = [
      {
        user_id: userId,
        vehicle_id: teslaId,
        category: 'fuel',
        title: 'ZES Hızlı Şarj',
        amount: 450,
        expense_date: '2026-04-01',
        created_at: new Date().toISOString()
      },
      {
        user_id: userId,
        vehicle_id: golfId,
        category: 'fuel',
        title: 'Shell V-Power',
        amount: 1200,
        expense_date: '2026-04-02',
        created_at: new Date().toISOString()
      },
      {
        user_id: userId,
        vehicle_id: teslaId,
        category: 'other',
        title: 'İç-Dış Yıkama',
        amount: 250,
        expense_date: '2026-04-03',
        created_at: new Date().toISOString()
      }
    ];

    for (const e of expenseData) {
      await db.from('expenses').insert(e);
    }

    console.log("Demo verileri başarıyla yüklendi!");
  } catch (error) {
    console.error("Demo verileri yüklenirken hata oluştu:", error);
  }
};
