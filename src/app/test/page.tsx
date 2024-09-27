"use client";

import { useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust the import path to match your project structure

const TestPage = () => {
  useEffect(() => {
    const testFirestore = async () => {
      try {
        // Attempt to add a simple test document to Firestore
        const docRef = await addDoc(collection(db, "testCollection"), {
          name: "Test User",
          createdAt: new Date(),
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    };

    testFirestore();
  }, []);

  return (
    <div>
      <h1>Testing Firestore Connectivity</h1>
      <p>Check the console for logs related to Firestore document creation.</p>
    </div>
  );
};

export default TestPage;
