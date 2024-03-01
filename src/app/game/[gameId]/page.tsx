"use client";
import React, { useEffect, useState } from 'react';
import database from "../../../lib/firebaseConfig";
import { ref, get, child, push, set, onValue, off, getDatabase } from 'firebase/database';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';
import CommentSection from "@/components/CommentSection"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot } from 'lucide-react';




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
    console.log(path);
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
  const [gameInfo, setGameInfo] = useState<GameInfo>({ gameId: '', userId: '', playerStatus: '', groupName: '', comment: '' });
  const [activeBool, setActiveBool] = useState(true); // Initially disabled
  const router = useRouter();
  const gameId = params.gameId;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]); // Add this line
  const [groupName, setGroupName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Initial state




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
          updateActiveBool(playerStatus, gameId, groupName);
        }
      });



    };

  

    const updateActiveBool = async (playerStatus: string, gameId: string, groupName: string) => {
      if (playerStatus == "active") {
        console.log("Player is active. ");
        console.log("Group Name: ");
        console.log(groupName);
        const fetchedComments = await fetchComments(gameId, groupName);
        console.log("FETCHED COMMENTS:");
        console.log(fetchedComments);
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
              setGroupName(groupName);
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
    const sequenceRef = ref(database, path2);

    //Refresh Comments
    setRefreshKey(oldKey => oldKey + 1); // Update state to trigger re-render

    get(sequenceRef).then((snapshot) => {
      if (snapshot.exists()) {
        const sequenceString = snapshot.val();
        console.log(sequenceString);

        const list = sequenceString.split(",");
        const index = list.indexOf(gameInfo.userId) + 1;
        console.log(index);

        if (index >= list.length) {
          console.log("Game is over. ");
          const path2next = `games/${gameInfo.gameId}/groups/${gameInfo.groupName}/status`;
          set(ref(database, path2next), "voting")
          router.push(`/voting/${gameInfo.gameId}/${gameInfo.groupName}`, undefined);
        }
        else {
          console.log("Game is NOT over. ");
          const path2next = `games/${gameInfo.gameId}/groups/${gameInfo.groupName}/users/${list[index]}/state`;
          console.log("AI NOW. Path:");
          console.log(path2next);
          const nextRef = ref(database, path2next);
          set(nextRef, "active");
          router.push(`/waitforvoting/${gameInfo.gameId}/${gameInfo.groupName}`, undefined);
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
    console.log("Submitted!");
  };

  return (
<div style={{ 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  minHeight: '100vh', // Allow the container to grow beyond the viewport height
  paddingTop: '20px', // Adds a 20px buffer at the top inside the container
  paddingLeft: '10px',
  paddingRight: '10px',
  overflowY: 'auto' // Ensure content can scroll vertically
}}>
      <Card className="w-[500px]">
      <CardHeader className="flex justify-center items-center">
      <CardTitle className="flex items-center">
  <Bot className="mr-1 scale-115" /> {/* Add margin-right to the icon */}
  <span>Convo</span>
</CardTitle>
</CardHeader>        <CardContent><img src='/images/voximage.jpg' alt="Article Image" style={{ borderRadius: '6px' }}></img>
          <div style={{paddingTop:'10px'}}><h1 className="text-2xl"><strong>The race to optimize grief</strong></h1></div>
          <div style={{paddingTop:'5px'}}><h2 className="text-la text-gray-600"><em>Startups are selling grief tech, ghostbots, and the end of mourning as we know it.</em></h2></div>
          <div style={{paddingTop:'10px', paddingBottom:'10px'}}><h3 className="text-sm ">by <u><strong><a href="https://www.vox.com/culture/23965584/grief-tech-ghostbots-ai-startups-replika-ethics">Mihika Agarwal</a></strong></u></h3></div>
          <h5 className="text-sm">
          <p>In the spring of 2023, Sunshine Henle found herself grappling with the profound loss of her 72-year-old mother, who succumbed to organ failure the previous Thanksgiving. Amidst her grief, Henle turned to an unconventional source of comfort: artificial intelligence. Leveraging OpenAI's ChatGPT, she crafted a "ghostbot" of her mother, infusing it with their shared text messages to simulate conversations that echoed her mother's voice and wisdom. This innovative approach to coping with her loss proved to be a source of solace for Henle, a Florida-based AI trainer accustomed to the potential of technology to mimic human interactions.</p>
          <br></br>
          <p>Henle's experience is situated within the burgeoning landscape of "grief tech," a niche but rapidly expanding field that intersects technology and bereavement support. Startups like Replika, HereAfter AI, StoryFile, and Seance AI are at the forefront of this movement, offering a variety of services designed to help individuals navigate their grief. These platforms employ deep learning and large language models to recreate the essence of lost loved ones, providing interactive video conversations, virtual avatars for texting, and audio legacies that aim to preserve the memory and presence of the deceased.</p>
          <br></br>
          <p>Despite the comfort these technologies offer to those like Henle, they also usher in a host of ethical and psychological dilemmas. Questions about the consent of the deceased, the potential for psychological dependency on digital avatars, and the risks of exacerbating grief through artificial prolongation of relationships are at the heart of the debate. Furthermore, the commercialization of grief, with services ranging from affordable subscriptions to premium packages, raises concerns about the exploitation of vulnerable individuals seeking closure.</p>
          <br></br>
          Summary adapted from article previously published in Vox News.
          </h5>



          
        </CardContent>
        <CardFooter>
          <div className="space-y-4 w-full"> {/* Adjust the spacing here as needed */}
            {/* "Comments" title on one line */}
            <h1>Comments</h1>

            {/* Comment section on one line */}
            <ul>
              <CommentSection gameId={gameId} groupName={groupName} key={refreshKey}/>
            </ul>

            {/* Input and Button on the same line */}
            <div className="flex w-full items-center space-x-2 ">
  <Input
    type="text"
    placeholder={activeBool ? "Wait your turn..." : "Write what you think!"}
    value={comment}
    className="flex-grow" // Make the input flexible to fill available space
    onChange={(e) => setComment(e.target.value)}
  />
  <Button type="button" onClick={handleSubmit} className="flex-shrink-0" disabled={activeBool}>
    Submit
  </Button>
</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
