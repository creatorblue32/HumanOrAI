"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import database from "../../lib/firebaseConfig";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'



const WaitingPage = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const GameID = searchParams.get('gameID'); // Using get method to extract gameID


  console.log(`GameID: ${GameID}`);





  useEffect(() => {
    if (!GameID) return; // Exit if GameID is not yet available

    const gameRef = ref(database, `games/${GameID}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.status === 'active') {
        // Redirect to the game page when the status changes to 'active'
        router.push(`/game?gameID=${GameID}`, undefined);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [GameID, router]);

  return (
    <div>
      Hold on! Waiting for game {GameID} to begin...
    </div>
  );
};

export default WaitingPage;


