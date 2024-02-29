"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import database from "../../../../lib/firebaseConfig";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'



const Page = ({ params }: { params: { gameId: string, groupName: string } }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const GameID = params.gameId;
  const GroupName = params.groupName;

  console.log(`GameID: ${GameID}`);


  useEffect(() => {
    if (!GameID) return; // Exit if GameID is not yet available

    const gameRef = ref(database, `games/${GameID}/groups/${GroupName}/status`);

    

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data == 'voting') {
        router.push(`/voting/${GameID}/${GroupName}`, undefined);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [GameID, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Thanks for your input. Please wait!
    </div>

  );
};

export default Page;


