import MetricsClient, {MetricsCounter, MetricsGauge, MetricsHistogram, MetricsSummary} from '@metrics/client';
import Metric from "@metrics/metric";

declare class TestConsumer  {
    constructor(metrics: MetricsClient);
    start();
    stop();
    getResults(): Promise<Array<Metric>>;
}
export = TestConsumer;
