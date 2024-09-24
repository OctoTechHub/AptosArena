import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useParams } from 'react-router-dom';

interface AreaGraphData {
  time: number;
  value: number;
  color: string;
}

const PlayerGraph: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [areaGraphData, setAreaGraphData] = useState<AreaGraphData[]>([]); // Store area graph data

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log(`WebSocket connection established. Sending playerId: ${id}`);
      socket.send(JSON.stringify({ playerId: id }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.playerId === id) {
        const currentValue = message.currentValue;
        const now = new Date().getTime();

        setAreaGraphData((prevData) => {
          const updatedData = [...prevData];
          const lastValue = prevData.length > 0 ? prevData[prevData.length - 1].value : currentValue;

          // Determine the color (green for rising, red for falling)
          const color = currentValue >= lastValue ? '#00ff00' : '#ff0000';

          updatedData.push({
            time: now,
            value: currentValue,
            color,
          });

          return updatedData;
        });
      }
    };

    return () => {
      socket.close();
    };
  }, [id]);

  const options = {
    chart: {
      type: 'area',
      backgroundColor: '#181818', // Dark background
    },
    title: {
      text: 'Player Value Over Time',
      style: { color: '#ffffff' },
    },
    yAxis: {
      title: {
        text: 'Value',
        style: { color: '#ffffff' },
      },
      gridLineColor: '#444',
      labels: {
        style: {
          color: '#ffffff',
        },
      },
    },
    xAxis: {
      type: 'datetime',
      labels: {
        style: {
          color: '#ffffff',
        },
      },
    },
    tooltip: {
      shared: true,
      style: {
        color: '#ffffff',
      },
    },
    plotOptions: {
      area: {
        fillOpacity: 0.5,
        marker: {
          enabled: false,
        },
        threshold: null,
      },
    },
    series: [
      {
        name: 'Player Value',
        data: areaGraphData.map(({ time, value }) => [time, value]),
        color: '#1e90ff',
        zones: areaGraphData.map(({ value, color }, index) => ({
          value: value,
          color: color, // Color transitions depending on rise or fall
        })),
        fillColor: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, 'rgba(0, 255, 0, 0.5)'], // Green for rising areas
            [1, 'rgba(255, 0, 0, 0.5)'], // Red for falling areas
          ],
        },
      },
    ],
  };

  return (
    <div className="flex w-screen bg-dark text-white p-5">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default PlayerGraph;
