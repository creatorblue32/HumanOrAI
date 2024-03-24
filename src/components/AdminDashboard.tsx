"use client";
import { useEffect, useState } from "react";
import { ref, get, child } from "firebase/database";
import database from "../lib/firebaseConfig";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import NumberCircle from "@/components/NumberCircle"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react';
import { BarChart4 } from 'lucide-react';
import { ActivitySquare } from 'lucide-react';
import { Pencil } from 'lucide-react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"







// Define a type for the component props if needed, e.g., if gameId and groupName are passed as props
interface adminProps {
    initialGameId: string | null; // Allow gameId to be null
}

const AdminDashboard: React.FC<adminProps> = ({ initialGameId }) => {
    // Define a CSS class for greyed-out content
    const greyedOutClass = "opacity-50 bg-gray-200";

    const [gameId, setGameId] = useState<string | null>(initialGameId);

    // Handler function for creating a new game
    const createGame = async () => {
        console.log("Create_game Clicked!")
        try {
            const response = await fetch('https://humanoraime.vercel.app/api/create_game');
            const data = await response.json();
            if (data.gameId) {
                setGameId(data.gameId);
            } else {
                console.error('Game ID not received');
            }
        } catch (error) {
            console.error('Error fetching new game ID:', error);
        }
    };


    return (
        <div className="w-[600px]">
            <Card className="h-[630px]">
                <CardHeader>
                    <CardTitle className="ml-2 text-4xl">Teacher Dashboard:</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`border border-white bg-transparent mb-5`}>
                        {/* Conditional rendering based on gameId presence */}
                        <div className={`flex items-start space-x-1 border border-white bg-transparent mb-3 rounded-[6px]`}>
                            <ActivitySquare />
                            <h1 className="text-xl font-medium">Actions</h1>
                        </div>

                        <Button variant="outline" className="h-[100px]" onClick={createGame}>
                            <div className="flex flex-col items-center justify-center h-screen">
                                <div className="mb-2 "><Plus className="stroke-slate-500" /></div>
                                <div className="text-slate-500">Create Game</div>
                            </div>
                        </Button>
                    </div>
                    <div className={`flex flex-col space-y-1 mb-3 rounded-[6px]`}>
                        <div className="flex items-center space-x-1">
                            <BarChart4 />
                            <h1 className="text-xl font-medium">Game Statistics</h1>
                        </div>
                        <div className="flex space-x-1">
                            <div className={`flex-1 ${gameId ? '' : greyedOutClass}`}>
                                Game ID<br></br>
                                {/* Display placeholder if gameId is null */}
                                <h1 className={`text-5xl font-semibold ${gameId ? '' : greyedOutClass}`}>
                                    {gameId || "N/A"}
                                </h1>
                                Current Players<br></br>
                                {/* Grey out or display placeholder based on gameId */}
                                <h1 className={`text-8xl font-semibold ${gameId ? '' : greyedOutClass}`}>
                                    {gameId ? "28" : "-"}
                                </h1>
                            </div>
                            <div className={`flex-1`}>
                                <h1 className="mb-2">Assigned Article:</h1>
                                <Card><CardHeader>
                                    <img src='/images/voximage.jpg' alt="Article Image" style={{ borderRadius: '6px', width: '250px', height: 'auto' }}></img>
                                    <CardTitle className="text-lg">The Race to Optimize Grief</CardTitle>
                                    <CardDescription>Startups are selling grief tech, ghostbots, and the end of mourning as we know it.</CardDescription>
                                    <HoverCard>
                                        <HoverCardTrigger>
                                            <div className="flex items-center justify-center" style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#e5e7eb' }}>
                                                <Pencil color="black" size={10} />
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent><h1 className="text-sm font-light">Unfortunately, you can't change articles just yet, but we're working on it!</h1></HoverCardContent>
                                    </HoverCard>
                                </CardHeader></Card>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
