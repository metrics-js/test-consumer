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
	 * Utility function returning an array of metric objects.
	 *
	 * @return {Promise<Array<import("@metrics/metric")>>} list of metrics
	 */
	async getResults() {
		return await this.result;
	}

	/**
	 * Stops metrics collection for the test, enabling you to inspect the stream.
	 */
	stop() {
		this.metrics.push(null);
		return this.result;
	}
}

module.exports = TestConsumer;
