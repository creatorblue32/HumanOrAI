"use client";
import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
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

const Page: React.FC<PageProps> = ({ params }) => {
  const [comments, setComments] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("Thanks for submitting... wait for your teacher to reveal the answers!");
  const [commentStyles, setCommentStyles] = useState<{[index: number]: string}>({});
  const { gameId, groupName, selectedCommentIndex } = params;

  useEffect(() => {
    const fetchComments = () => {
      const path = `games/${gameId}/groups/${groupName}/users`;
      const dbRef = ref(database, path);
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          const users = snapshot.val();
          const newComments = Object.values(users).map((user: any) => user.comment);
          setComments(newComments);
        } else {
          console.log("No data available");
        }
      });
    };

    fetchComments();
    const aiCommentIndexRef = ref(database, `games/${gameId}/groups/${groupName}/ai_comment_index`);
    onValue(aiCommentIndexRef, (snapshot) => {
      const aiCommentIndex = snapshot.val();
      if (aiCommentIndex === parseInt(selectedCommentIndex, 10)) {
        setStatusMessage("You got it correct!");
        setCommentStyles({[aiCommentIndex]: 'bg-green-500'});
      } else {
        setStatusMessage("That's not quite right. You got fooled!" + selectedCommentIndex + String(aiCommentIndex));
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
