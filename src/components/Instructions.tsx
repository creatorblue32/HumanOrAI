"use client;"
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



// Define a type for the component props if needed, e.g., if gameId and groupName are passed as props
interface instructionsProps {
    gameId: string | null;
}

const Instructions: React.FC<instructionsProps> = ({ gameId }) => {
    useEffect(() => {
        console.log('Received new gameId in Instructions:', gameId);
    }, [gameId]);
    return (
        <div className="w-[300px]">
            <Card className="h-[630px]" >
                <CardContent>
                    <CardTitle className=" mt-6">Instructions to Join:</CardTitle>

                    <NumberCircle number={1} text="Scan the QR code below or type in the link:" />
                    <h1 className="text-xl ml-2 font-semibold">humanoraime.vercel.app</h1>
                    <img src='/images/joinqr.png' alt="Article Image" style={{ borderRadius: '6px', width: '250px', height: 'auto' }}></img>
                    <NumberCircle number={2} text="Enter the game code below: " />
                    <h1 className="text-8xl font-semibold">{gameId}</h1>
                </CardContent>
            </Card>
        </div>
    );
};

export default Instructions;
