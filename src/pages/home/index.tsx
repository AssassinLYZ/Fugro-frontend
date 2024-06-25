import React, { useEffect, useRef } from "react";
import styles from "./index.module.scss";
import ToastContainer from "@/components/toast";
import InforBoard from "./components/board";
import Map from "./components/map";
import WebSocketClient from "@/lib/apis/WebSocketClient";
import config from "@/config";
import useStore from "@/store/postions";
import { formatTime } from "@/lib/utils";

const Home: React.FC = () => {
  const {
    currentPosition,
    total,
    setPositionAverage,
    setTotal,
    setCurrentPosition,
    setCurrentPositions,
  } = useStore();
  const wsClientRef = useRef<WebSocketClient | null>(null);
  useEffect(() => {
    // connect to backend to receive data
    if (!wsClientRef.current) {
      wsClientRef.current = new WebSocketClient(config.websocketUrl!);
      wsClientRef.current.onMessage((message: string) => {
        try {
          const data = JSON.parse(message);
          const formatedPosition = { ...data, timeStamp: formatTime() };
          setCurrentPosition(formatedPosition);
          setTotal((prevTotal) => {
            return prevTotal + 1;
          });
        } catch (err) {
          console.error("Error parsing message", err);
        }
      });
    }
    return () => {
      if (wsClientRef.current) {
        // disconnect websocket
        wsClientRef.current?.close();
      }
    };
  }, []);

  useEffect(() => {
    // caculate the average point
    if (total > 0) {
      setPositionAverage((prev) => {
        return {
          lat: Number(
            ((prev.lat * (total - 1) + currentPosition.lat) / total).toFixed(4)
          ),
          lng: Number(
            ((prev.lng * (total - 1) + currentPosition.lng) / total).toFixed(4)
          ),
        };
      });

      setCurrentPositions((prevPositions) => [
        currentPosition,
        ...prevPositions,
      ]);
    }
  }, [total]);

  return (
    <div className={styles.home}>
      <InforBoard Info={currentPosition} total={total} />
      <Map />
      <ToastContainer />
    </div>
  );
};

export default Home;
