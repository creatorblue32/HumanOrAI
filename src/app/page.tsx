// src/pages/page.tsx
import JoinGameCard from '@/components/JoinGameCard';
import LogoComponent from '@/components/LogoComponent';

export default function Page() {
  return (
<div>
  <div className="bg-white w-full h-16 fixed top-0 z-10 shadow-md">
    <LogoComponent />
  </div>

  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <JoinGameCard />
  </div>

  {/* Footer */}
  <div className="bg-white w-full h-12 fixed bottom-0 z-10 shadow-md">
    <div className="flex justify-center items-center h-full">
      {/* Footer content here */}
      <h2 className="text-xs text-gray-400">created by: creatorblue32</h2>
    </div>
  </div>
</div>

  );
}

