const express = require("express");
const path = require("path");
require("dotenv").config();
const rateLimiter = require("./rate-limiter");

const app = express();
app.use(express.json());

const port = process.env.PUBLIC_PORT || 3000;
const minuteWindow = parseInt(process.env.MINUTE_IN_SECONDS);
const allowedCalls = parseInt(process.env.ALLOWED_REQUESTS_PER_MINUTE);

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get(
	"/api/notifications",
	rateLimiter({ minuteWindow: minuteWindow, allowedCalls: allowedCalls }),
	async (req, res) => {
		return res.status(200).json({
			status: 200,
			response: "Request Processed",
			availableRequestsInAMinite: req.availableRequestsInAMinite,
			availableRequestsInAMonth: req.availableRequestsInAMonth,
		});
	}
);

const server = app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});

module.exports = server;
