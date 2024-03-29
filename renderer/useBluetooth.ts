import { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { notificationsState } from "./states/notifications";
import { SnackbarNotification } from "./types";

const detectDevice = (
  setChar: (BluetoothRemoteGATTCharacteristic) => void
): Promise<void> => {
  console.log("requestDevice");
  return new Promise((resolve, reject) => {
    navigator.bluetooth
      .requestDevice({
        filters: [{ name: "UFO-TW" }],
        optionalServices: [
          "40ee0100-63ec-4b7f-8ce7-712efd55b90e",
          "40ee0200-63ec-4b7f-8ce7-712efd55b90e",
          "40ee2222-63ec-4b7f-8ce7-712efd55b90e",
          "722a1c08-1a25-4941-6205-bd0fd52415a9",
        ],
      })
      .then((device: BluetoothDevice) => {
        console.log("connect to gatt server: ", device);
        device.addEventListener("gattserverdisconnected", () => {
          device.gatt.disconnect();
          setChar(null);
        });
        window.addEventListener("beforeunload", () => {
          device.gatt.disconnect();
        });
        return device.gatt.connect();
      })
      .then((gattServer: BluetoothRemoteGATTServer) =>
        gattServer.getPrimaryServices()
      )
      .then((services) =>
        services[0].getCharacteristic("40ee0202-63ec-4b7f-8ce7-712efd55b90e")
      )
      .then(setChar)
      .then(resolve)
      .catch(reject);
  });
};

export const useBluetooth = (): {
  connected: boolean;
  connecting: boolean;
  device: BluetoothRemoteGATTCharacteristic | null;
  requestDevice: () => void;
} => {
  const [char, setChar] = useState<BluetoothRemoteGATTCharacteristic | null>(
    null
  );
  const setNotifications = useSetRecoilState(notificationsState);
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    const newNotification: SnackbarNotification = {
      title: "",
      severity: "success",
      createdAt: new Date(),
      done: false,
      scope: "bluetooth",
    };
    if (char) {
      newNotification.title = "Bluetooth Device connected";
      setNotifications((ns) => [...ns, newNotification]);
    }
    const disconnect = () => {
      char?.service.device?.gatt?.disconnect();
      newNotification.title = "Bluetooth Device disconnected";
      setNotifications((ns) => [...ns, newNotification]);
    };
    window.mainProc.addListener("quit", disconnect);
    return () => {
      window.mainProc.removeListener("quit", disconnect);
    };
  }, [char, setNotifications]);
  return {
    device: char,
    connected: char != null && char.service.device?.gatt?.connected,
    connecting,
    requestDevice: () => {
      setConnecting(true);
      detectDevice(setChar).finally(() => setConnecting(false));
    },
  };
};
