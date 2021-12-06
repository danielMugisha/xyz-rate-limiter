const { describe, it } = require("mocha");
require("chai/register-should");
const chaiHttp = require("chai-http");
const chai = require("chai");
const server = require("../index");
const _ = require("lodash");

let expect = chai.expect;
chai.use(chaiHttp);

describe("Testing if the API serves the html page", () => {
	it("First request", (done) => {
		chai
			.request(server)
			.get("/")
			.end((err, res) => {
				expect(res).to.have.status(200);
				done();
			});
	});
});

describe("Testing the API Requests per minute", () => {
	it("Second request", (done) => {
		chai
			.request(server)
			.get("/api/notifications")
			.end((err, res) => {
				expect(res).to.have.status(200);
				done();
			});
	});
});

describe("Testing if the API Response has necessay info", () => {
	it("Third request", (done) => {
		chai
			.request(server)
			.get("/api/notifications")
			.end((err, res) => {
				res.body.should.be.a("object");
				res.body.should.have.property("response");
				res.body.should.have.property("availableRequestsInAMinite");
				res.body.should.have.property("availableRequestsInAMonth");
				done();
			});
	});
});

describe("Testing many requests per minute", () => {
	it("Fourth request", (done) => {
		let requests = _.range(100);
		var count = 0;
		var length = requests.length;

		if (length === 0) {
			done();
		}

		requests.forEach(function (rec) {
			chai
				.request(server)
				.get("/api/notifications")
				.end(function (err, res) {
					if (err) {
						this.skip();
					} else {
						count++;
						if (count == length) {
							expect(res).to.have.status(429);
							res.body.should.have
								.property("response")
								.eql("too many requests per minute");
							done();
						}
					}
				});
		});
	});
});
