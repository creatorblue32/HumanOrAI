"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDatabase, ref, get, set, child } from 'firebase/database';
import database from "../../../../lib/firebaseConfig";
import CommentSection from "@/components/CommentSection"; // Ensure use if needed
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Params {
  gameId: string;
  groupName: string;
}

interface PageProps {
  params: Params;
}

async function fetchComments(gameId: string, groupName: string): Promise<string[]> {
  const dbRef = ref(database);
  let commentsArray: string[] = [];
  try {
    const path = `games/${gameId}/groups/${groupName}/users`;
    const snapshot = await get(child(dbRef, path));

    if (snapshot.exists()) {
      const users = snapshot.val();
      commentsArray = Object.values(users).map((user: any) => user.comment);
    } else {
      console.log("No data available");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return commentsArray;
}

const Page: React.FC<PageProps> = ({ params }) => {
  const [comments, setComments] = useState<string[]>([]);
  const router = useRouter();
  const gameId = params.gameId;
  const groupName = params.groupName;
  const [selectedCommentIndex, setSelectedCommentIndex] = useState<number | null>(null);

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCommentIndex(Number(event.target.value));
  };

  const getUserId = (gameId: string): string | null => {
    const userIDsByGameIDString = localStorage.getItem('userIdsByGameCode');
    if (userIDsByGameIDString) {
      const userIDsByGameID = JSON.parse(userIDsByGameIDString);
      return userIDsByGameID[gameId] || null;
    }
    return null;
  };

  const handleSubmit = (): void => {
    const userId = getUserId(gameId);
    if (selectedCommentIndex !== null) {
      const path = `games/${gameId}/groups/${groupName}/users/${userId}/vote`;
      const dbRef = ref(database, path);
      set(dbRef, selectedCommentIndex)
      router.push(`/answers/${gameId}/${groupName}/${selectedCommentIndex}`)
    } else {
      alert("No comment selected");
    }
  };

  useEffect(() => {
    if (typeof gameId === 'string' && typeof groupName === 'string') {
      fetchComments(gameId, groupName)
        .then(setComments)
        .catch(console.error);
    }
  }, [gameId, groupName]);

  return (
    <div>
      <Card>
        <CardHeader>
          <h1 className="text-xl">Which one do you think is AI?</h1>
          <h2>Comments</h2>
          <ul>
            <div>
              {comments.map((comment, index) => (
                comment !== "" && (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      name="commentSelection"
                      value={index}
                      onChange={handleSelectionChange}
                      className="mr-3"
                      style={{
                        accentColor: 'grey'
                      }}
                    />
                    <div style={{
                      width: '30px',
                      height: '30px',
                      minWidth: '30px',
                      minHeight: '30px',
                      backgroundColor: 'grey',
                      borderRadius: '50%'
                    }}></div>
                    <div className="comment-text ml-3">
                      <h4 className="text-md font-semibold">AnonUser</h4>
                      <h5 className="text-sm">{comment}</h5>
                    </div>
                  </div>
                )
              ))}
            </div>
            <Button onClick={handleSubmit}>Submit</Button>
          </ul>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Page;
