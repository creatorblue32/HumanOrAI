// src/pages/page.tsx
import LogoComponent from '@/components/LogoComponent';
import React, { useState } from 'react';
import Instructions from '@/components/Instructions';
import Head from 'next/head';
import AdminDashboard from '@/components/AdminDashboard';


export default function Page() {

  const placeHolderGameId = "----";
  const [gameId, setGameId] = useState<string | null>(null);

  const updateGameId = (newGameId: string) => {
    setGameId(newGameId);
  };


  return (
    <div>
      <Head>
        <title>Convo Dashboard</title>
      </Head>

      <div className="bg-white w-full h-16 fixed top-0 z-10 shadow-md">
        <LogoComponent />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <AdminDashboard initialGameId={gameId} onGameIdUpdate={updateGameId} />
      <div className="m-4"></div>
        <Instructions gameId={placeHolderGameId} />
      </div>

      {/* Footer */}
      <div className="bg-white w-full h-12 fixed bottom-0 z-10 shadow-md">
        <div className="flex justify-center items-center h-full">
<h2 className="text-xs text-gray-400">created by: creatorblue32</h2>
        </div>
      </div>
    </div>

  );
}

