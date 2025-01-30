"use strict";

const { test } = require("tap");
const MetricsClient = require("@metrics/client");
const { TestConsumer, createMetric } = require("../lib/index");

test("has a start and stop method", async (t) => {
	const testHelper = new TestConsumer(new MetricsClient());
	t.equal(typeof testHelper.start, "function");
	t.equal(typeof testHelper.stop, "function");
});

test("returns result summary", async (t) => {
	const metrics = new MetricsClient();
	const testHelper = new TestConsumer(metrics);

	testHelper.start(); // This sets up the passed in metrics client so results can be read

	const counter = metrics.counter({
		name: "a_custom_counter_metric",
		description: "A custom metric",
	});
	counter.inc(1, { labels: { type: "some_label" } });

	testHelper.stop(); // This ends the streams and now we can get the result.
	const result = await testHelper.getResults();
	t.equal(result.length, 1);
	result.forEach((res) => {
		t.equal(res.name, "a_custom_counter_metric");
		res.labels.forEach((metricLabel) => {
			if (metricLabel.name === "type") {
				t.equal(metricLabel.value, "some_label");
			}
		});
	});
});

test("can create dummy metric for counter & timer", async (t) => {
	const counter = createMetric.counter({ uri: "/lol" });
	t.equal(counter.name, "http_requests_total");
	const timer = createMetric.timer({ uri: "/lol2" });
	t.equal(timer.name, "http_request_duration_seconds");
});
