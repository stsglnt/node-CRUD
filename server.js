const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("./middleware/logger");
const morgan = require("morgan");
const connectDB = require("./config/db");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const colors = require("colors");
const errorHandler = require("./middleware/error");
// Load env vars
dotenv.config({ path: "./config/config.env" });
// Connect to database
connectDB();

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");
const app = express();

// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());
// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// File uploading
app.use(fileupload({}));

// Sanitize data
app.use(mongoSanitize());
// Set security headers
app.use(helmet());
// Prevent XSS attacks
app.use(xss());
// Rate Limiting
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, // 10 min
  max: 1
});

app.use(limiter);
// Prevent http param polution
app.use(hpp({}));
// Enable CORS
app.use(cors());
// Set static folder
app.use(express.static(path.join(__dirname, "public")));
// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close server & exit process
  server.close(() => process.exit(1));
});
