import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { useNotifications } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from "@/firebase";

import { Vehicle, HomeAsset } from "@/components/garage/types";
import { GarageHeader } from "@/components/garage/GarageHeader";
import { PremiumBanner, MonetizationBanner } from "@/components/garage/Banners";
import { VehicleCard, HomeCard, EmptyAssetCard } from "@/components/garage/AssetCards";
import { AddAssetModal } from "@/components/garage/AddAssetModal";

export default function Garage() {
  const { activeMember } = useFamily();
  const { addNotification } = useNotifications();
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
  const [inspectionExpiry, setInspectionExpiry] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [setReminder, setSetReminder] = useState(true);
  
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

    const qVehicles = query(
      collection(db, "vehicles"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribeVehicles = onSnapshot(qVehicles, (snapshot) => {
      const vehicleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehicleData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vehicles:", error);
      setLoading(false);
    });

    const qHomes = query(
      collection(db, "homes"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribeHomes = onSnapshot(qHomes, (snapshot) => {
      const homeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HomeAsset[];
      setHomes(homeData);
    }, (error) => {
      console.error("Error fetching homes:", error);
    });

    const qMaintenance = query(
      collection(db, "maintenance_records"),
      where("user_id", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribeMaintenance = onSnapshot(qMaintenance, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaintenanceRecords(records);
    }, (error) => {
      console.error("Error fetching maintenance:", error);
    });

    return () => {
      unsubscribeVehicles();
      unsubscribeHomes();
      unsubscribeMaintenance();
    };
  }, [user]);

  const handleAddAsset = async () => {
    if (!user) return;

    if (assetType === "vehicle") {
      if (!assetName.trim() || !brand.trim() || !model.trim() || !year) return;
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "vehicles"), {
          user_id: user.uid,
          plate: assetName,
          brand_model: `${brand} ${model}`,
          brand: brand,
          model: model,
          year: Number(year),
          mileage: Number(mileage),
          fuel_type: fuelType,
          insurance_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          inspection_expiry: inspectionExpiry,
          tax_status: 'Ödendi',
          created_at: serverTimestamp()
        });

        if (setReminder) {
          addNotification({
            title: "Muayene Hatırlatıcısı Kuruldu",
            message: `${assetName} plakalı aracınızın muayenesi için hatırlatıcı ayarlandı.`,
            type: "info"
          });
        }

        setIsAddingAsset(false);
        setAssetName("");
        setBrand("");
        setModel("");
        setYear(new Date().getFullYear());
        setFuelType("Benzin");
        setMileage(0);
        setInspectionExpiry(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error adding vehicle:', error);
        alert("Araç eklenirken bir hata oluştu.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!assetName.trim() || !assetDetail.trim()) return;
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "homes"), {
          user_id: user.uid,
          name: assetName,
          address: assetDetail,
          created_at: serverTimestamp()
        });

        setIsAddingAsset(false);
        setAssetName("");
        setAssetDetail("");
      } catch (error) {
        console.error('Error adding home:', error);
        alert("Konut eklenirken bir hata oluştu.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 relative w-full overflow-x-hidden">
      <GarageHeader onAddClick={() => setIsAddingAsset(true)} />

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
        onClose={() => setIsAddingAsset(false)}
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
        setReminder={setReminder}
        setSetReminder={setSetReminder}
        isSubmitting={isSubmitting}
        onSubmit={handleAddAsset}
      />
    </div>
  );
}
