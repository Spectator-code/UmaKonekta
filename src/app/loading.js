import FarmerLoadingScreen from '@/components/FarmerLoadingScreen';

export default function Loading() {
  return (
    <div className="flex w-full items-center justify-center min-h-[50vh]">
      <FarmerLoadingScreen 
        message="Loading UmaKonekta..." 
        subtext="Connecting to Philippine Agricultural Resource Network" 
        fullScreen={false}
      />
    </div>
  );
}
