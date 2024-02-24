"use client";
import { useEffect, useState } from "react";
import { ref, push, child, get, set } from "firebase/database";
import database from "../lib/firebaseConfig";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';


const JoinGameCard = () => {
  const [data, setData] = useState<any>(null);
  const [gameCode, setGameCode] = useState('');
  const [userId, setUserId] = useState('');

  const router = useRouter();

  const saveUserIdToLocalStorage = (gameCode: string, userId: string): void => {
    // Retrieve the existing mapping from local storage
    const existingMapping: Record<string, string> = JSON.parse(localStorage.getItem('userIdsByGameCode') || '{}');
    
    // Update the mapping with the new user ID for the specified game code
    const updatedMapping: Record<string, string> = { ...existingMapping, [gameCode]: userId };
    
    // Save the updated mapping back to local storage
    localStorage.setItem('userIdsByGameCode', JSON.stringify(updatedMapping));
  };
  
  const getUserIdFromLocalStorage = (gameCode: string): string | undefined => {
    // Retrieve the mapping from local storage
    const mapping: Record<string, string> = JSON.parse(localStorage.getItem('userIdsByGameCode') || '{}');
    
    // Return the user ID associated with the game code, or undefined if not found
    return mapping[gameCode];
  };
  

  

  const handleSubmit = (): void => {
    if (gameCode.trim() === '') {
      alert('Please enter a game code.');
      return;
    }

    const existingUserId = getUserIdFromLocalStorage(gameCode);

    if (existingUserId) {
      console.log('Using existing user-id from local storage for this game code:', existingUserId);
      router.push(`/waiting/${gameCode}`, undefined);
      return;
    }

    const gameCodeRef = ref(database, `gameIndex/${gameCode}`);
get(gameCodeRef).then((snapshot) => {
  if (snapshot.exists()) {
    const path = `games/${gameCode}/unassigned_users`;
    const dbRef = ref(database, path);

    // Create a new child reference and use it to add data to the database
    const newChildRef = push(dbRef);
    set(newChildRef, "") // Assuming you want to write an empty string or some initial data
      .then(() => {
        const generatedUserId: string = newChildRef.key || 'No ID generated';
        setUserId(generatedUserId);
        saveUserIdToLocalStorage(gameCode, generatedUserId);
        console.log(`User added to unassigned users as ${generatedUserId}`);
        router.push(`/waiting/${gameCode}`, undefined);
      })
      .catch((error) => console.error(error));
  } else {
    alert('Invalid game code. Please enter a valid code.');
  }
}).catch((error) => {
  console.error('Error fetching game code:', error);
});
  };



  return (
    <div>
      <h1>Join Game:</h1>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="text" placeholder="Enter Game Code" value={gameCode} onChange={(e) => setGameCode(e.target.value)} />
        <Button type="button" onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
};

export default JoinGameCard;

