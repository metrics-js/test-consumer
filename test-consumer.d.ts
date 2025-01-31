import MetricsClient from '@metrics/client';
import Metric from "@metrics/metric";

declare class TestConsumer {
    constructor(metrics: MetricsClient);

    start();

    stop();

    getResults(): Promise<Array<Metric>>;
}

declare namespace TestConsumer {
    /**
     * Contains utility functions for creating `Metrics` objects in tests.
     */
    export interface CreateMetric {
        timer: (options: CreateMetricOptions) => Metric;
        counter: (options: CreateMetricOptions) => Metric;
    }

    type CreateMetricOptions = {
        uri?: string;
        method?: string;
        status?: number | string;
        type?: string | Object
    }
    export const createMetric: CreateMetric;
}
export = TestConsumer;
