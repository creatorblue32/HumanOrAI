"use client";
import React, { useEffect, useState } from 'react';
import database from "../../../lib/firebaseConfig";
import { ref, get, child, push, set, onValue, off, getDatabase} from 'firebase/database';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';


interface GameInfo {
  gameId: string,
  userId: string,
  playerStatus: string,
  groupName: string, // Add groupName to the interface
  comment: string
}

async function fetchComments(gameId: string, groupName: string): Promise<string[]> {
  const dbRef = ref(database);
  let commentsArray: string[] = []; // Initialize an empty array to store comments
  console.log("Fetched Comments!");
  try {
    const path = `games/${gameId}/groups/${groupName}/users`;
    const snapshot = await get(child(dbRef, path));

    if (snapshot.exists()) {
      const users = snapshot.val();
      commentsArray = Object.values(users).map((user: any) => user.comment); // Collect comments
    } else {
      console.log("No data available");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return commentsArray; // Return the array of comments
}

const Page = ({ params }: { params: { gameId: string } }) => {
  const [gameInfo, setGameInfo] = useState<GameInfo>({ gameId: '', userId: '', playerStatus: '', groupName: '', comment: ''});
  const [activeBool, setActiveBool] = useState(true); // Initially disabled
  const router = useRouter();
  const gameId = params.gameId;

  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]); // Add this line



useEffect(() => {
  const database = getDatabase();
  const getUserId = (gameId: string): string | null => {
    const userIDsByGameIDString = localStorage.getItem('userIdsByGameCode');
    if (userIDsByGameIDString) {
      const userIDsByGameID = JSON.parse(userIDsByGameIDString);
      return userIDsByGameID[gameId] || null;
    }
    return null;
  };

  const setupPlayerStatusListener = (gameId: string, userId: string, groupName: string) => {
    const userStatusRef = ref(database, `games/${gameId}/groups/${groupName}/users/${userId}/state`);
    onValue(userStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        const playerStatus = snapshot.val();
        setGameInfo((prevGameInfo) => ({
          ...prevGameInfo,
          playerStatus
        }));
        updateActiveBool(playerStatus);
      }
    });
  };

  const updateActiveBool = async (playerStatus: string) => {
    if (playerStatus == "active") {
      const fetchedComments = await fetchComments(gameInfo.gameId, gameInfo.groupName);
      setComments(fetchedComments); // Update the comments state with fetched comments
      console.log("Updated Active Bool to True");
    } else {
      console.log("Updated to false.");
    }
    setActiveBool(playerStatus !== "active");
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
    const groupsRef = ref(database, `games/${gameId}/groups`);
    const groupsSnapshot = await get(groupsRef);

    if (groupsSnapshot.exists()) {
      const groups = groupsSnapshot.val();
      for (const groupName in groups) {
        const userPath = `${groupName}/users/${userId}`;
        const userRef = child(groupsRef, userPath);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const playerStatus = userSnapshot.val().state || null;
          if (playerStatus && groupName) {
            setGameInfo({ gameId, userId, playerStatus, groupName, comment });
            setupPlayerStatusListener(gameId, userId, groupName); // Setup listener
            return; // Exit after setting up listener
          }
        }
      }
    }

    console.error('PlayerStatus or GroupName not found.');
  };

  displayGameInfo();

  // Cleanup function to remove the listener
  return () => {
    const userId = getUserId(gameId);
    if (userId) {
      const groupName = gameInfo.groupName; // Assuming groupName is stored in state
      const userStatusRef = ref(database, `games/${gameId}/groups/${groupName}/users/${userId}/state`);
      off(userStatusRef); // Remove the listener
    }
  };
}, [gameId]); // Add gameId as a dependency to useEffect


  const handleSubmit = (): void => {
    gameInfo.comment = comment;

    const path = `games/${gameInfo.gameId}/groups/${gameInfo.groupName}/users/${gameInfo.userId}/comment`;
    const dbRef = ref(database, path);

    set(dbRef, comment)

    const path2 = `games/${gameInfo.gameId}/groups/${gameInfo.groupName}/sequence`;
    const sequenceRef = ref(database,path2);

    get(sequenceRef).then((snapshot) => {
      if (snapshot.exists()) {
        const sequenceString = snapshot.val();
        console.log(sequenceString); 
        
        const list = sequenceString.split(",");
        const index = list.indexOf(gameInfo.userId) + 1;
        console.log(index);

        if (index >= list.length-1){
          console.log("Game is over. ");
            router.push(`/gameOver/${gameInfo.gameId}/${gameInfo.groupName}`, undefined);
        }
        else{
          console.log(list.length)
          console.log("Game is NOT  over. ");

          if (list[index] == "AI"){
            const path2model = `games/${gameInfo.gameId}/groups/${gameInfo.groupName}/model`;
            const path2Modelref = ref(database,path2model);
            set(path2Modelref,"active");
          }
          else {
            const path2next = `games/${gameInfo.gameId}/groups/${gameInfo.groupName}/users/${list[index]}/state`;
            const nextRef = ref(database,path2next);
            set(nextRef,"active");
          }

        }

      
      } else {
        console.log(path2);
        console.log('No sequence');
      }
    }).catch((error) => {
      console.error(error);
    });





    
    

    // Split the input string by commas into an array
    //const list = inputString.split(',');

    // Find the index of the searchString in the array
    //const index = list.indexOf(searchString);


    

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


      <h2>Comments</h2>
    <ul>

      {comments.map((comment, index) => (
        <li key={index}>{comment}</li>
      ))}
    </ul>
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input 
      type="text" 
       placeholder={activeBool ? "Wait your turn..." : "Enter your comment!"} 
       value={comment} 
     onChange={(e) => setComment(e.target.value)} 
/>
        <Button type="button" onClick={handleSubmit} disabled={activeBool}>Submit</Button>
      </div>



    </div>
  );
};

export default Page;
