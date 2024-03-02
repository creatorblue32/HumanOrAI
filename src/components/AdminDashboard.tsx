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






// Define a type for the component props if needed, e.g., if gameId and groupName are passed as props
interface adminProps {
    gameId: string;
}

const AdminDashboard: React.FC<adminProps> = ({ gameId }) => {
    // State hook for managing comments with TypeScript specifying it's an array of strings

    return (



<div className="w-[600px]">
    <Card className="h-[600px]">
        <CardHeader>
            <CardTitle className="ml-2 text-4xl">Teacher Dashboard:</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="border border-white bg-transparent mb-5">
            <div className="flex items-start space-x-1 border border-white bg-transparent mb-3 rounded-[6px]">
            <ActivitySquare />
                <h1 className="text-xl font-medium">Actions</h1>
            </div>

                <Button variant="outline" className="h-[100px]">  
                    <div className="flex flex-col items-center justify-center h-screen">
                        <div className="mb-2 "><Plus className="stroke-slate-500" /></div>
                        <div className="text-slate-500">Create Game</div>
                    </div>
                </Button>
            </div>
            <div className="flex items-start space-x-1 h-[330px] mb-3 rounded-[6px]">
            <BarChart4 />
                <h1 className="text-xl font-medium 	">Game Statistics</h1>
            </div>
        </CardContent>
    </Card>
</div>






    );
};

export default AdminDashboard;
