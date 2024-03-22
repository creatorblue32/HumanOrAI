"use client";
// pages/call-python.js
import { useState, useEffect } from 'react';

export default function CallPython() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/hello')
            .then((res) => res.json())
            .then((data) => setMessage(data.message))
            .catch((err) => console.error("Error fetching data:", err));
    }, []);

    return (
        <div>
            <h1>Response from Python Serverless Function</h1>
            <p>{message}</p>
        </div>
    );
}

