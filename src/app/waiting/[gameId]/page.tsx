"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import database from "../../../lib/firebaseConfig";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
 




const Page = ({ params }: { params: { gameId: string } }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const GameID = params.gameId;
  console.log(`GameID: ${GameID}`);


  useEffect(() => {
    if (!GameID) return; // Exit if GameID is not yet available

    const gameRef = ref(database, `games/${GameID}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.status === 'active') {
        // Redirect to the game page when the status changes to 'active'
        router.push(`/game/${GameID}`, undefined);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [GameID, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Card className="w-[350px]">
      <CardHeader>
      <CardTitle>Hold on!</CardTitle>
      <CardDescription>Waiting for game {GameID} to begin...</CardDescription>

</CardHeader>
    <CardContent>
    <div className="flex justify-center items-center">
    <div className="spinner"></div>
  </div></CardContent>
      </Card>

    </div>
  );
};

export default Page;


