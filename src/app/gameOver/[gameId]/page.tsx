"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import database from "../../../lib/firebaseConfig";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'



const Page = ({ params }: { params: { gameId: string } }) => {

  return (
    <div>
      Game {params.gameId} is OVER!!...
    </div>
  );
};

export default Page;


