const redis = require("./redis-client");

const rateLimiter = ({ secondsWindow, allowedCalls }) => {
	return async (req, res, next) => {
		const MAX_REQ_PER_MONTH = 20;
		const user = req.socket.remoteAddress;
		const instantRequests = await redis.incr(user);
		let monthlyRequests = await redis.get(`${user}_monthly`);
		let ttl;
		let monthly_ttl = await redis.ttl(`${user}_monthly`);

		if (monthlyRequests < MAX_REQ_PER_MONTH) {
			if (instantRequests === 1) {
				await redis.expire(user, secondsWindow);
				ttl = secondsWindow;
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
					await redis.expire(`${user}_monthly`, 30);
					monthly_ttl = 30;
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
