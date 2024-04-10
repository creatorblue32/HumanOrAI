"use client";
import React, { useEffect, useState } from 'react';
import { getDatabase, ref,get, child, onValue } from 'firebase/database';
import database from "../../../../../lib/firebaseConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Params {
  gameId: string;
  groupName: string;
  selectedCommentIndex: string;
}

interface PageProps {
  params: Params;
}

async function fetchComments(gameId: string, groupName: string): Promise<string[]> {
  const dbRef = ref(database);
  let commentsArray: string[] = [];
  try {
    // Fetch the sequence string
    const sequencePath = `games/${gameId}/groups/${groupName}/sequence`;
    const sequenceSnapshot = await get(child(dbRef, sequencePath));
    let userIdOrder: string[] = [];
    
    if (sequenceSnapshot.exists()) {
      // Split the sequence string to get an ordered array of user IDs
      userIdOrder = sequenceSnapshot.val().split(',');
    } else {
      console.log("No sequence data available");
      return commentsArray; // Return early if no sequence is found
    }

    // Fetch user comments as before
    const usersPath = `games/${gameId}/groups/${groupName}/users`;
    const usersSnapshot = await get(child(dbRef, usersPath));

    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();
      // Initialize an empty object to hold userId-comment pairs
      const userIdComments: { [key: string]: string } = {};

      // Populate the userIdComments object
      Object.values(users).forEach((user: any) => {
        userIdComments[user.userId] = user.comment;
      });

      commentsArray = userIdOrder.map(userId => userIdComments[userId]).filter(comment => comment !== undefined);
      console.log("Got em!");
      console.log(commentsArray);
    } else {
      console.log("No user data available");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return commentsArray;
}


const Page: React.FC<PageProps> = ({ params }) => {
  const [comments, setComments] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("Thanks for submitting... wait for your teacher to reveal the answers!");
  const [commentStyles, setCommentStyles] = useState<{[index: number]: string}>({});
  const { gameId, groupName, selectedCommentIndex } = params;

  useEffect(() => {
    const loadComments = async () => {
      try {
        // Await the fetchComments function to get the actual comments array
        const commentsArray = await fetchComments(gameId, groupName);
        // Then set the state with the resolved value
        setComments(commentsArray);
      } catch (error) {
        console.error("Failed to load comments:", error);
        // Optionally, set an error message or handle the error in another way
        setStatusMessage("Failed to load comments.");
      }
    };
    loadComments();

    const aiCommentIndexRef = ref(database, `games/${gameId}/groups/${groupName}/ai_comment_index`);
    onValue(aiCommentIndexRef, (snapshot) => {
      const aiCommentIndex = snapshot.val();
      if (aiCommentIndex == null) {
        console.log("No problem... waiting!");
      }
      else if (aiCommentIndex === parseInt(selectedCommentIndex, 10)) {
        setStatusMessage("You got it correct!");
        setCommentStyles({[aiCommentIndex]: 'bg-green-500'});
      } else {
        setStatusMessage("That's not quite right. You got fooled!");
        setCommentStyles({
          [parseInt(selectedCommentIndex, 10)]: 'bg-red-500',
          [aiCommentIndex]: 'bg-green-500'
        });
      }
    });
  }, [gameId, groupName, selectedCommentIndex]);

  return (
    <div>
      <Card className='m-5'>
        <CardHeader>
          <h1 className="text-xl">{statusMessage}</h1>
          <h2>Comments</h2>
          <ul>
            {comments.map((comment, index) => (
              comment !== "" && (
                <li key={index} className={`flex items-center p-2 ${commentStyles[index] || 'bg-gray-200'} my-1 rounded-md`}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    minWidth: '30px',
                    minHeight: '30px',
                    borderRadius: '50%',
                    marginRight: '10px',
                  }}></div>
                  <div className="comment-text">
                    <h4 className="text-md font-semibold">AnonUser</h4>
                    <h5 className="text-sm">{comment}</h5>
                  </div>
                </li>
              )
            ))}
          </ul>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Page;
