import { useEffect, useState } from "react";
import { ref, get, child } from "firebase/database";
import database from "../lib/firebaseConfig";

// Define a type for the component props if needed, e.g., if gameId and groupName are passed as props
interface commentSectionProps {
  gameId: string;
  groupName: string;
}

const CommentSection: React.FC<commentSectionProps> = ({ gameId, groupName }) => {
    // State hook for managing comments with TypeScript specifying it's an array of strings
    const [comments, setComments] = useState<string[]>([]);

    useEffect(() => {
        // Define the async function inside useEffect with TypeScript
        const fetchComments = async () => {
            const dbRef = ref(database);
            let commentsArray: string[] = [];
            try {
              // Fetching the sequence of user IDs
              const sequencePath = `games/${gameId}/groups/${groupName}/sequence`;
              const sequenceSnapshot = await get(child(dbRef, sequencePath));
              let userIds: string[] = [];
              if (sequenceSnapshot.exists()) {
                const sequence = sequenceSnapshot.val();
                userIds = sequence.split(',').filter((id: string) => id !== ''); // Splitting by comma and removing the last empty element if any
              }
      
              // Fetching comments for each user ID in the sequence
              for (const userId of userIds) {
                const userPath = `games/${gameId}/groups/${groupName}/users/${userId}/comment`;
                const commentSnapshot = await get(child(dbRef, userPath));
                if (commentSnapshot.exists()) {
                  commentsArray.push(commentSnapshot.val());
                } else {
                  commentsArray.push('No comment'); // Default text if there's no comment
                }
              }
            } catch (error) {
              console.error("Error fetching data:", error);
            }
            // Update the state with fetched comments
            setComments(commentsArray);
          };      

        // Call the fetch function
        fetchComments();
    }, [gameId, groupName]); // Add gameId and groupName as dependencies

    // Render comments
    return (
        <div>
            {comments.map((comment, index) => (
                comment !== "" && (
                    <div key={index} className="flex items-center">
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
    );
};

export default CommentSection;
