"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDatabase, ref, get, child } from 'firebase/database';
import database from "../../../../lib/firebaseConfig";
import CommentSection from "@/components/CommentSection"



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


const Page = ({ params }: { params: { gameId: string, groupName: string } }) => {
  const [comments, setComments] = useState<string[]>([]);
  const router = useRouter();
  // Explicitly cast the query parameters to strings, as they are initially of type string | string[] | undefined
  const gameId = params.gameId;
  const groupName = params.groupName;

  useEffect(() => {
    // Check if both gameId and groupName are strings before calling fetchComments to satisfy TypeScript checks
    if (typeof gameId === 'string' && typeof groupName === 'string') {
      fetchComments(gameId, groupName)
        .then(setComments)
        .catch((error) => console.error("Failed to fetch comments:", error));
    }
  }, [gameId, groupName]); // This effect depends on gameId and groupName

  return (
    <div>
      Game {gameId} is OVER!!...

      <h2>Comments</h2>
      <ul>
      <CommentSection gameId={gameId} groupName={groupName} />


      </ul>
    </div>
  );
};

export default Page;
