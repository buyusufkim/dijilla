import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { vehicleSchema } from '@/domain/requests';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { db, supabase } from "@/lib/supabase-service";

import { Vehicle, HomeAsset } from "@/components/garage/types";
import { GarageHeader } from "@/components/garage/GarageHeader";
import { PremiumBanner, MonetizationBanner } from "@/components/garage/Banners";
import { VehicleCard, HomeCard, EmptyAssetCard } from "@/components/garage/AssetCards";
import { AddAssetModal } from "@/components/garage/AddAssetModal";

export default function Garage() {
  const { activeMember } = useFamily();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [assetType, setAssetType] = useState<"vehicle" | "home">("vehicle");
  const [assetName, setAssetName] = useState("");
  const [assetDetail, setAssetDetail] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [fuelType, setFuelType] = useState("Benzin");
  const [mileage, setMileage] = useState(0);
  const [inspectionExpiry, setInspectionExpiry] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reload, setReload] = useState(0);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [homes, setHomes] = useState<HomeAsset[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchVehicles = async () => {
      const { data, error } = await db.from("vehicles").select("*").eq("user_id", user.id);
      if (error) setErrorMessage('Araçlar yüklenemedi. Lütfen yeniden deneyin.');
      if (data) setVehicles(data as Vehicle[]);
      setLoading(false);
    };
    fetchVehicles();

    const fetchHomes = async () => {
      const { data, error } = await db.from("homes").select("*").eq("user_id", user.id);
      if (error) setErrorMessage('Konutlar yüklenemedi. Lütfen yeniden deneyin.');
      if (data) setHomes(data as HomeAsset[]);
    };
    fetchHomes();

    const fetchMaintenance = async () => {
      const { data, error } = await db.from("maintenance_records").select("*").eq("user_id", user.id).order('date', { ascending: false });
      if (error) setErrorMessage('Bakım kayıtları yüklenemedi. Lütfen yeniden deneyin.');
      if (data) setMaintenanceRecords(data);
    };
    fetchMaintenance();

    const vSub = supabase.channel('garage_vehicles').on("postgres_changes", { event: "*", schema: "public", table: "vehicles", filter: `user_id=eq.${user.id}` }, fetchVehicles).subscribe();
    const hSub = supabase.channel('garage_homes').on("postgres_changes", { event: "*", schema: "public", table: "homes", filter: `user_id=eq.${user.id}` }, fetchHomes).subscribe();
    const mSub = supabase.channel('garage_maintenance').on("postgres_changes", { event: "*", schema: "public", table: "maintenance_records", filter: `user_id=eq.${user.id}` }, fetchMaintenance).subscribe();

    return () => {
      supabase.removeChannel(vSub);
      supabase.removeChannel(hSub);
      supabase.removeChannel(mSub);
    };
  }, [user, reload]);

  const handleAddAsset = async () => {
    if (!user || isSubmitting) return;
    setErrorMessage('');

    if (assetType === "vehicle") {
      if (!assetName.trim() || !brand.trim() || !model.trim() || !year) return;
      setIsSubmitting(true);
      try {
        const validated = vehicleSchema.parse({plate:assetName,brand,model,modelYear:Number(year),usage:'Otomobil (Hususi)'});
        if (!Number.isInteger(mileage) || mileage < 0 || mileage > 10000000) throw new Error('Kilometre geçerli değil.');
        const { data, error } = await db.from("vehicles").insert({
          user_id: user.id,
          plate: validated.plate,
          brand: validated.brand,
          model: validated.model,
          brand_model: `${validated.brand} ${validated.model}`,
          year: Number(year),
          mileage: Number(mileage),
          fuel_type: fuelType,
          insurance_expiry: null,
          inspection_expiry: inspectionExpiry || null,
          tax_status: null
        }).select('*').single();
        if (error || !data) throw error || new Error('Kayıt doğrulanamadı.');
        setVehicles(rows => [...rows.filter(row => row.id !== data.id), data]);

        setIsAddingAsset(false);
        setAssetName("");
        setBrand("");
        setModel("");
        setYear(new Date().getFullYear());
        setFuelType("Benzin");
        setMileage(0);
        setInspectionExpiry('');
      } catch (error) {
        setErrorMessage('Araç kaydedilemedi. Plaka, yıl ve kilometre bilgilerini kontrol edin; formunuz korunuyor.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!assetName.trim() || !assetDetail.trim()) return;
      setIsSubmitting(true);
      try {
        const { data, error } = await db.from("homes").insert({
          user_id: user.id,
          name: assetName,
          address: assetDetail
        }).select('*').single();
        if (error || !data) throw error || new Error('Kayıt doğrulanamadı.');
        setHomes(rows => [...rows.filter(row => row.id !== data.id), data]);

        setIsAddingAsset(false);
        setAssetName("");
        setAssetDetail("");
      } catch (error) {
        setErrorMessage('Konut kaydedilemedi. Bilgileriniz formda duruyor; tekrar deneyin.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 relative w-full overflow-x-hidden">
      <GarageHeader onAddClick={() => setIsAddingAsset(true)} />
      {errorMessage && <p role="alert" className="text-red-300">{errorMessage} <button className="underline" onClick={()=>{setErrorMessage('');setReload(v=>v+1);}}>Yeniden yükle</button></p>}

      <PremiumBanner onClick={() => navigate('/premium')} />

      {vehicles.length > 0 && (
        <MonetizationBanner 
          vehicle={vehicles[0]} 
          onClick={() => navigate(`/insurance-purchase/${vehicles[0].id}`)} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Vehicles */}
        <div className="space-y-6 md:col-span-2 xl:col-span-2">
          <h2 className="text-xl font-semibold">Araçlar</h2>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyAssetCard type="vehicle" onClick={() => { setAssetType("vehicle"); setIsAddingAsset(true); }} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id}
                  vehicle={vehicle}
                  maintenanceRecords={maintenanceRecords}
                  onNavigate={navigate}
                />
              ))}
              <EmptyAssetCard type="vehicle" onClick={() => { setAssetType("vehicle"); setIsAddingAsset(true); }} />
            </div>
          )}
        </div>

        {/* Real Estate */}
        <div className="space-y-6 md:col-span-2 xl:col-span-1">
          <h2 className="text-xl font-semibold">Konutlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
            {homes.map((home) => (
              <HomeCard key={home.id} home={home} />
            ))}
            <EmptyAssetCard type="home" onClick={() => { setAssetType("home"); setIsAddingAsset(true); }} />
          </div>
        </div>
      </div>

      <AddAssetModal 
        isOpen={isAddingAsset}
        onClose={() => { if (!isSubmitting) setIsAddingAsset(false); }}
        assetType={assetType}
        setAssetType={setAssetType}
        assetName={assetName}
        setAssetName={setAssetName}
        assetDetail={assetDetail}
        setAssetDetail={setAssetDetail}
        brand={brand}
        setBrand={setBrand}
        model={model}
        setModel={setModel}
        year={year}
        setYear={setYear}
        fuelType={fuelType}
        setFuelType={setFuelType}
        mileage={mileage}
        setMileage={setMileage}
        inspectionExpiry={inspectionExpiry}
        setInspectionExpiry={setInspectionExpiry}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        onSubmit={handleAddAsset}
      />
    </div>
  );
}
