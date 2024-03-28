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
import { RefreshCcw } from 'lucide-react';




interface Group {
    groupId: number;
    progress: number;
  }
  
  interface GridButtonProps {
    group: Group;
  }

  interface GroupsGridProps {
    groups: Group[];
  }
  
  const GroupsGrid: React.FC<GroupsGridProps> = ({ groups }) => {
    return (
      <div className="grid grid-cols-4 ">
        {groups.map((group) => (
          <GridButton key={group.groupId} group={group} />
        ))}
      </div>
    );
  };
  

const GridButton: React.FC<GridButtonProps> = ({ group }) => {
    return (
      <Button variant="outline"
        className="y-6 x-4 rounded m-1"
        type="button"
      >
        {`${group.progress}`}
      </Button>
    );
  };
  
enum Status{
    NoGame, Open, Active, Voting, Complete
}


// Define a type for the component props if needed, e.g., if gameId and groupName are passed as props
interface adminProps {
    initialGameId: string | null; // Allow gameId to be null
}

const AdminDashboard: React.FC<adminProps> = ({ initialGameId }) => {
    // Define a CSS class for greyed-out content
    const greyedOutClass = "text-gray-200";

    const [gameId, setGameId] = useState<string | null>(initialGameId);
    const [num_players, setNum_players] = useState<string | null>("0");
    const [game_status, set_game_status] = useState<Status>(Status.NoGame)

    const groups: Group[] = [
        { groupId: 1, progress: 1 },
        { groupId: 2, progress: 3 },
        { groupId: 3, progress: 2 },
        { groupId: 4, progress: 6 },
        { groupId: 5, progress: 4 },
        { groupId: 6, progress: 5 },
        { groupId: 7, progress: 1 },
        { groupId: 8, progress: 2 },
      ];
    
    

    // Handler function for creating a new game
    const createGame = async () => {
        console.log("Create_game Clicked!")
        try {
            const response = await fetch('https://humanoraime.vercel.app/api/create_game');
            const data = await response.json();
            if (data.gameId) {
                setGameId(data.gameId);
                set_game_status(Status.Open);
            } else {
                console.error('Game ID not received');
            }
        } catch (error) {
            console.error('Error fetching new game ID:', error);
        }
    };

    // Handler function for creating a new game
    const get_num_players = async () => {
        console.log("num_players requested!")
        try {
            const response = await fetch('https://humanoraime.vercel.app/api/num_players?gameId='+gameId);
            const data = await response.json();
            if (data.num_players) {
                setNum_players(data.num_players);
            } else {
                console.error('Num players not received');
            }
        } catch (error) {
            console.error('Error fetching new num players:', error);
        }
    };

    const beginGame = async () => {
        console.log("begin_game Clicked!")
        try {
            const response = await fetch('https://humanoraime.vercel.app/api/begin_game?gameId='+gameId);
            const data = await response.json();
            if (data.success) {
                if (data.success == true){
                    set_game_status(Status.Active);
                }
                else {
                    console.error("No Success.")
                }
            } else {
                console.error('Nothing Success Signal Recieved');
            }
        } catch (error) {
            console.error('Error with Fetch.', error);
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

                        <Button variant="outline" disabled={game_status==Status.NoGame} className="h-[100px] mr-2" onClick={createGame}>
                            <div className="flex flex-col items-center justify-center h-screen">
                                <div className="mb-2 "><Plus className="stroke-slate-500" /></div>
                                <div className="text-slate-500">Create Game</div>
                            </div>
                        </Button>
                        <Button variant="outline" disabled={game_status==Status.Open} className="h-[100px] mr-2" onClick={beginGame}>
                            <div className="flex flex-col items-center justify-center h-screen">
                                <div className="mb-2 "><Plus className="stroke-slate-500" /></div>
                                <div className="text-slate-500">Begin Play</div>
                            </div>
                        </Button>
                        <Button variant="outline" disabled={game_status==Status.Active} className="h-[100px] mr-2" onClick={createGame}>
                            <div className="flex flex-col items-center justify-center h-screen">
                                <div className="mb-2 "><Plus className="stroke-slate-500" /></div>
                                <div className="text-slate-500">Begin Voting</div>
                            </div>
                        </Button>
                        <Button variant="outline" disabled={game_status==Status.Voting} className="h-[100px] mr-2" onClick={createGame}>
                            <div className="flex flex-col items-center justify-center h-screen">
                                <div className="mb-2 "><Plus className="stroke-slate-500" /></div>
                                <div className="text-slate-500">Archive Game</div>
                            </div>
                        </Button>
                    </div>
                    <div className={`flex flex-col space-y-1 mb-3 rounded-[6px]`}>
                        <div className="flex items-center space-x-1">
                            <BarChart4 />
                            <h1 className="text-xl font-medium">Game Statistics</h1>
                        </div>
                        <div className="flex space-x-1">
                            <div className={`flex-1`}>
                                Game ID<br></br>
                                <h1 className={`text-5xl font-semibold ${gameId ? '' : greyedOutClass}`}>
                                    {gameId || "- - - -"}
                                </h1>
                                <div className="flex">
                                    <div className="m-3 ml-0">
                                    Current Players<br></br>
                                    <div className="flex items-center justify-center"><h1 className={`text-7xl font-semibold ${gameId ? '' : greyedOutClass}`}>
                                        {gameId ? num_players : "--"}
                                    </h1> <Button variant="outline" onClick={get_num_players}><RefreshCcw className="h-3 w-3"/></Button></div>
                                    </div>
                                    <div className="m-3 ml-0">
                                    Game Status<br></br>
                                    <div className="bg-slate-200 ">No Game Yet.</div>
                                    </div>
                                </div>
                                Group Progress<br></br>
                                <GroupsGrid groups={groups} />
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
