"use client";
import React, { useEffect, useState } from 'react';
import database from "../lib/firebaseConfig";
import { ref, get, child, push, set } from 'firebase/database';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


interface GameInfo {
  gameId: string,
  userId: string,
  playerStatus: string,
  groupName: string, // Add groupName to the interface
  comment: string
}

const GameStatus: React.FC = () => {
  const [gameInfo, setGameInfo] = useState<GameInfo>({ gameId: '', userId: '', playerStatus: '', groupName: '', comment: ''});

  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameID'); 

  const [comment, setComment] = useState('');


  useEffect(() => {
    const getUserId = (gameId: string): string | null => {
      const userIDsByGameIDString = localStorage.getItem('userIdsByGameCode');
      if (userIDsByGameIDString) {
        const userIDsByGameID = JSON.parse(userIDsByGameIDString);
        return userIDsByGameID[gameId] || null;
      }
      return null;
    };


    const getPlayerStatus = async (gameId: string, userId: string): Promise<{ playerStatus: string | null, groupName: string | null }> => {
      const groupsRef = ref(database, `games/${gameId}/groups`);
      const groupsSnapshot = await get(groupsRef);
    
      if (groupsSnapshot.exists()) {
        const groups = groupsSnapshot.val();
        for (const groupName in groups) {
          const userPath = `${groupName}/users/${userId}`;
          const userRef = child(groupsRef, userPath);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            return { playerStatus: userSnapshot.val().state || null, groupName: groupName };
          }
        }
      }
    
      return { playerStatus: null, groupName: null };
    };

    const displayGameInfo = async () => {
      if (!gameId) {
        console.error(`GameID ${gameId} not provided in URL.`);
        return;
      }
      const userId = getUserId(gameId);
      if (!userId) {
        console.error(`UserID not found for provided GameID ${gameId}`);
        return;
      }
      const { playerStatus, groupName } = await getPlayerStatus(gameId, userId);
      if (!playerStatus || !groupName) {
        console.error('PlayerStatus or GroupName not found.');
        return;
      }
      setGameInfo({ gameId, userId, playerStatus, groupName, comment });
    };

    displayGameInfo();
  }, [gameId]); // Add gameId as a dependency to useEffect

  const handleSubmit = (): void => {
    gameInfo.comment = comment;

    const path = `games/${gameInfo.gameId}/groups/${gameInfo.groupName}/users/${gameInfo.userId}/comment`;
    const dbRef = ref(database, path);
    set(dbRef, comment)


    console.log(comment);
    console.log("Submitted!");
  };

  return (
    <div>
      <h1>Game Information</h1>
      <p>GameID: {gameInfo.gameId}</p>
      <p>UserID: {gameInfo.userId}</p>
      <p>PlayerStatus: {gameInfo.playerStatus}</p>
      <p>GroupName: {gameInfo.groupName}</p> {/* Display the group name */}

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="text" placeholder="Enter Game Code" value={comment} onChange={(e) => setComment(e.target.value)} />
        <Button type="button" onClick={handleSubmit}>Submit</Button>
      </div>

    </div>
  );
};

export default GameStatus;
