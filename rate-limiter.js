const redis = require("./redis-client");

const rateLimiter = ({ minuteWindow, allowedCalls }) => {
	return async (req, res, next) => {
		const MAX_REQ_PER_MONTH = parseInt(process.env.ALLOWED_MONTHLY_REQUESTS);
		const MONTH_IN_SECONDS = parseInt(process.env.MONTH_IN_SECONDS);
		const user = req.socket.remoteAddress;
		const instantRequests = await redis.incr(user);
		let monthlyRequests = await redis.get(`${user}_monthly`);
		let ttl;
		let monthly_ttl = await redis.ttl(`${user}_monthly`);

		if (monthlyRequests < MAX_REQ_PER_MONTH) {
			if (instantRequests === 1) {
				await redis.expire(user, minuteWindow);
				ttl = minuteWindow;
			} else {
				ttl = await redis.ttl(user);
			}
			if (instantRequests > allowedCalls) {
				return res.status(429).json({
					status: 429,
					response: "too many requests per minute",
					availableRequestsInAMinite: 0,
					availableRequestsInAMonth: MAX_REQ_PER_MONTH - monthlyRequests,
				});
			} else {
				monthlyRequests = await redis.incr(`${user}_monthly`);
				if (monthlyRequests === 1) {
					await redis.expire(`${user}_monthly`, MONTH_IN_SECONDS);
					monthly_ttl = MONTH_IN_SECONDS;
				} else {
					monthly_ttl = await redis.ttl(`${user}_monthly`);
				}
				req.availableRequestsInAMinite = allowedCalls - instantRequests;
				req.availableRequestsInAMonth = MAX_REQ_PER_MONTH - monthlyRequests;
				req.status = 200;
				next();
			}
		} else {
			return res.status(429).json({
				response: "too many requests per month",
				availableRequestsInAMinite: 0,
				availableRequestsInAMonth: 0,
				status: 429,
			});
		}
	};
};

module.exports = rateLimiter;
