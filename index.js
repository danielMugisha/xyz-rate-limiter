const express = require("express");
const path = require("path");
require("dotenv").config();
const rateLimiter = require("./rate-limiter");

const app = express();
app.use(express.json());

const port = process.env.PUBLIC_PORT || 3000;

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get(
	"/api/notifications",
	rateLimiter({ secondsWindow: 10, allowedCalls: 4 }),
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
