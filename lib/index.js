"use strict";

const { Writable } = require("readable-stream");

/**
 * Helper class for tests `@metrics` packages.
 *
 * @Usage
 * ```js
 * import Metrics from "@metrics/client";
 * import TestConsumer from "@metrics/test-consumer";
 *
 * test("some test case", async () => {
 * 		const metrics = new Metrics();
 *  	const testHelper = new TestConsumer(metrics)*
 *  	testHelper.start();
 *
 *  	// Do something which triggers metrics collection
 *
 *  	testHelper.stop();
 *
 *  	const result = await testHelper.getResults();
 *  	// Do assertions on the result
 * });
 * ```
 */
class TestConsumer {
	/**
	 * Returns a new timing test helper object.
	 * @param {import("@metrics/client")} metrics - Metrics client object
	 */
	constructor(metrics) {
		this.metrics = metrics;
	}

	/**
	 * Function to run at the start of a test fixture.
	 * It sets up streams for writing metrics and to read results.
	 * The consumer returned should be piped onto a `MetricsClient`.
	 * While the result is where you would later read the results when the stream ends.
	 */
	start() {
		const data = [];

		const consumer = new Writable({
			objectMode: true,
			write(chunk, encoding, callback) {
				data.push(chunk);
				callback();
			},
		});

		const result = new Promise((resolve, reject) => {
			consumer.on("finish", () => resolve(data));
			consumer.on("err", (err) => reject(err));
		});
		this.metrics.pipe(consumer);
		this.result = result;
	}

	/**
	 * Utility function returning an array of simple metric object.
	 * @return {Promise<Array<Partial<import("@metrics/metric")>>>} list of simplified metrics
	 */
	async getResults() {
		return (await this.result).map((metric) => ({
			name: metric.name,
			labels: metric.labels,
		}));
	}

	/**
	 * Stops metrics collection for the test, enabling you to inspect the stream.
	 */
	stop() {
		this.metrics.push(null);
		return this.result;
	}
}

/**
 * Helper object for creating dummy metrics for tests.
 */
const createMetric = {
	/**
	 * Returns a metrics object for a timer
	 * @param {object} [options={}]
	 * @param {string} [options.uri]
	 * @param {string} [options.method]
	 * @param {string|number} [options.status]
	 * @param {string|object} [options.type]
	 * @return {{name, labels: *[]}}
	 */
	timer: (options = {}) => {
		const { uri, method, status, type } = options;
		return createMetric.base({
			name: "http_request_duration_seconds",
			uri,
			method,
			status,
			type,
		});
	},

	/**
	 * Returns a metrics object for a counter
	 * @param {object} [options={}]
	 * @param {string} [options.uri]
	 * @param {string} [options.method]
	 * @param {string|number} [options.status]
	 * @param {object} [options.type]
	 * @return {{name, labels: *[]}}
	 */
	counter: (options = {}) => {
		const { uri, method, status, type } = options;

		return createMetric.base({
			name: "http_requests_total",
			uri,
			method,
			status,
			type,
		});
	},

	/**
	 * @param {object} options
	 * @param {string} options.name
	 * @param {string} options.uri=undefined
	 * @param {string} options.method="GET"
	 * @param {string|number} options.status=204
	 * @param {object} options.type=undefined
	 * @return {{name, labels: *[]}}
	 * @private
	 */
	base: ({ name, uri = undefined, method = "GET", status = 204, type = undefined }) => ({
		name,
		labels: [
			...(method ? [{ name: "method", value: method }] : []),
			...[
				{
					name: "type",
					value: type,
				},
			],
			...(uri ? [{ name: "uri", value: uri }] : []),
			...(status ? [{ name: "status", value: status }] : []),
		],
	}),
};

module.exports = TestConsumer;
module.exports.createMetric = createMetric;
