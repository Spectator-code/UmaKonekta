/**
 * @file loading.js
 * @description React Component / Page for loading.js. Handles UI rendering and local state.
 * @module loading
 * 
 * @notes
 * - Ensure all imports are correctly resolved.
 * - Follows standard React and Next.js conventions.
 * - Requires proper authentication context for protected routes.
 */

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
