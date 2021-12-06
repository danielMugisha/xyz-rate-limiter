# XYZ Rate Limiter

Notification service performance solution.

### Documentation

| Methods |     Endpoints      |                      Actions |
| ------- | :----------------: | ---------------------------: |
| GET     |         /          | Serve html page on port 3000 |
| GET     | /api/notifications |   make notification requests |

### Setup

#### Tools to install on your local machine if not interested in docker

- Redis server

#### Project installation

- clone the repo: `git clone https://github.com/danielMugisha/xyz-rate-limiter.git`
- switch to project directory : `cd xyz-rate-limiter`
- install all required dependencies: `npm install`
- start the server : `npm run dev`

### Testing enpoints

`npm test`

### Examples

- I am using a simple html page to test the requests

```
- When the html page is served on port 3000, we can click the button to hit localhost:3000/api/notifications in the example we simulate a minute as 10 seconds and a month as 30 seconds. and we are allowed 4 requests per minute(10 seconds) and 20 requests per month(30 seconds).

For the first request and all processed requests:
Request: localhost:3000/api/notifications
 Response:
 {
    "status": 200,
	"response": "Request Processed",
	"availableRequestsInAMinite": 3,(keeps on reducing as your allowed tests reduce)
	"availableRequestsInAMonth": 19,(keeps on reducing as your allowed tests reduce)
}

and the information will be displayed on the page

For more than 4 requests in a minute (10 seconds):
Request: localhost:3000/api/notifications
 Response:
 {
    "status": 429,
	"response": "too many requests per minute",
	"availableRequestsInAMinite": 0,
	"availableRequestsInAMonth": 16,(this might change according to how many requests have been processed)
}

and the information will be displayed on the page

For more than 20 requests in a month (30 seconds):
Request: localhost:3000/api/notifications
 Response:
 {
    "status": 429,
	"response": "too many requests per month",
	"availableRequestsInAMinite": 0,
	"availableRequestsInAMonth": 0,
}

and the information will be displayed on the page

```
