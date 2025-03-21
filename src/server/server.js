// import path from "path";
// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";

// // Initialize Express app
// const app = express();

// // Middleware setup
// const setupMiddleware = () => {
//   app.use(
//     cors({
//       origin: "*", // Allow all origins for development
//       methods: ["GET", "POST"], // Allow these methods
//       allowedHeaders: ["Content-Type", "Authorization"],
//     })
//   );
//   app.use(express.static("dist"));
//   app.use(express.json());
//   app.use(bodyParser.json());
// };

// // Route handlers
// const setupRoutes = () => {
//   // GET route for home page
//   app.get("/", (req, res) => {
//     try {
//       res.sendFile(path.join(__dirname, "dist", "index.html"));
//     } catch (error) {
//       console.error("Error serving index.html:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   });

//   // POST route to handle trip data
//   app.post("/tripData", (req, res) => {
//     try {
//       const tripData = req.body;
//       console.log("Received trip data:", tripData);
//       res.status(200).json({
//         message: "Trip data received successfully",
//         data: tripData,
//       });
//     } catch (error) {
//       console.error("Error processing trip data:", error);
//       res.status(500).json({ error: "Failed to process trip data" });
//     }
//   });
// };

// // Start the server
// const startServer = () => {
//   const PORT = 8000;
//   const server = app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
//   return server;
// };

// // Initialize the application
// const initializeApp = () => {
//   setupMiddleware();
//   setupRoutes();
//   const server = startServer();
//   return { app, server };
// };

// // Export the initialized app and server
// export default initializeApp;

import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Middleware setup
const setupMiddleware = () => {
  app.use(
    cors({
      origin: "*", // Allow all origins for development
      methods: ["GET", "POST"], // Allow these methods
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Serve static files from the "dist" directory
  app.use(express.static(path.join(__dirname, "dist")));

  // Parse JSON bodies
  app.use(express.json());
  app.use(bodyParser.json());
};

// Route handlers
const setupRoutes = () => {
  // GET route for home page
  app.get("/", (req, res) => {
    try {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    } catch (error) {
      console.error("Error serving index.html:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // POST route to handle trip data
  app.post("/tripData", (req, res) => {
    try {
      const tripData = req.body;
      console.log("Received trip data:", tripData);
      res.status(200).json({
        message: "Trip data received successfully",
        data: tripData,
      });
    } catch (error) {
      console.error("Error processing trip data:", error);
      res.status(500).json({ error: "Failed to process trip data" });
    }
  });
};

// Start the server
const startServer = () => {
  const PORT = 8000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  return server;
};

// Initialize the application
const initializeApp = () => {
  setupMiddleware();
  setupRoutes();
  const server = startServer();
  return { app, server };
};

// Export the initialized app and server
export default initializeApp;