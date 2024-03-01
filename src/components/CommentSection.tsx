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
            let commentsArray: string[] = []; // Specifying array of strings for TypeScript
            console.log("Fetched Comments!");
            try {
                const path = `games/${gameId}/groups/${groupName}/users`;
                console.log(path);
                const snapshot = await get(child(dbRef, path));
        
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    commentsArray = Object.values(users).map((user: any) => user.comment as string); // Cast user.comment to string
                } else {
                    console.log("No data available");
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
                            width: '50px',
                            height: '50px',
                            minWidth: '50px',
                            minHeight: '50px',
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
