const ai = require('./expense-tracker-backend/config/gemini'); 

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      // Changed the prompt text to specify JavaScript/Node.js
      contents: "Write a high-performance JavaScript validation function for a user login form in a Node.js/Express backend.",
    });

    console.log("--- AI Response ---");
    console.log(response.text); 
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

run();