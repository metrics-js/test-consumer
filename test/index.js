"use strict";

const { test } = require("tap");
const MetricsClient = require("@metrics/client");

const TestConsumer = require("../lib/index");
const { createMetric } = TestConsumer;

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

test("lets you get the value of a counter", async (t) => {
	// Pass in the metrics client you want to consume.
	const metrics = new MetricsClient();
	const testHelper = new TestConsumer(metrics);
	// Sets up the consumer to capture events.
	testHelper.start();

	const counter = metrics.counter({
		name: "a_custom_counter_metric",
		description: "A custom metric",
	});
	counter.inc(2, { labels: { type: "some_label" } });

	// Ends the streams, now we can get the result.
	testHelper.stop();

	const result = await testHelper.getResults();
	const metric = result.find((m) => m.name === "a_custom_counter_metric");

	t.ok(metric, "Expected to find metric a_custom_counter_metric");
	t.equal(metric.value, 2);
});
