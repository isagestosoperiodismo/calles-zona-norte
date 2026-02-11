<script lang="ts">
    import type { cityT, tempRegrT, tempT } from "$lib";
    import { dot, line, plot } from "@observablehq/plot";

    let {
        city,
        temp,
        tempRegr,
    }: {
        city: cityT;
        temp: tempT;
        tempRegr: tempRegrT;
    } = $props();

    let width = $state(0);

    function makeChart(
        node: Element,
        params: {
            city: cityT;
            temp: tempT;
            tempRegr: tempRegrT;
            width: number;
        },
    ) {
        const { city, temp, tempRegr } = params;

        const tempCity = temp.filter((t) => t.city === city);

        // We create x and y coordinates to draw a line based on the linear regression.
        const regressionCity = tempRegr.find((r) => r.city === city);
        if (regressionCity === undefined) {
            throw new Error(`City ${city} not found in tempRegr.`);
        }
        const x1 = tempCity[0].decade;
        const x2 = tempCity[tempCity.length - 1].decade;
        const y1 = regressionCity.yIntercept + x1 * regressionCity.slope;
        const y2 = regressionCity.yIntercept + x2 * regressionCity.slope;
        const regressionLine = [
            { decade: x1, meanTemp: y1 },
            { decade: x2, meanTemp: y2 },
        ];

        const caption = `Mean temperature per decade in ${city}. Linear regression: y = ${regressionCity.slope}x + ${regressionCity.yIntercept}, R² = ${regressionCity.r2}`;

        const chart = plot({
            width,
            x: { label: "Time", tickFormat: (d) => String(d) },
            y: {
                label: "Temperature",
                tickFormat: (d) => `${d}°C`,
                ticks: 5,
            },
            inset: 20,
            grid: true,
            marks: [
                line(regressionLine, {
                    x: "decade",
                    y: "meanTemp",
                    stroke: "black",
                    strokeDasharray: "4,4",
                }),
                dot(tempCity, {
                    x: "decade",
                    y: "meanTemp",
                    fill: "orange",
                    r: 5,
                }),
            ],
            caption,
        });

        node.appendChild(chart);
    }
</script>

{#key [city, width]}
    <div
        style="width: 100%;"
        bind:clientWidth={width}
        use:makeChart={{ city, temp, tempRegr, width }}
    ></div>
{/key}