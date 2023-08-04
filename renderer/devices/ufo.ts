export const scaleAndClamp = (
  value: number,
  ufoScaleFactor: number
): number => {
  const scaledVal = Math.floor(value * ufoScaleFactor);
  if (scaledVal >= 100) return 100;
  return scaledVal;
};

export const createBuffer = (values: number[]): Uint8Array => {
  const buf = new Uint8Array(values.length);
  for (let i = 0; i < values.length; i++) {
    buf[i] = values[i] & 255;
  }
  return buf;
};

export const useUfoDataGenerator =
  (ufoScaleFactor: number, inverted: boolean) =>
  (record: number[]): number[] => {
    if (record.length === 5) {
      // UFO TW format
      const [_time, leftDir, leftPower, rightDir, rightPower] = record;
      const leftScaled = scaleAndClamp(leftPower, ufoScaleFactor);
      const rightScaled = scaleAndClamp(rightPower, ufoScaleFactor);
      if (inverted) {
        return [
          0x05,
          rightScaled + (rightDir ? 128 : 0),
          leftScaled + (leftDir ? 128 : 0),
        ];
      } else {
        return [
          0x05,
          leftScaled + (leftDir ? 128 : 0),
          rightScaled + (rightDir ? 128 : 0),
        ];
      }
    }
    if (record.length === 3) {
      // UFO SA format
      const [_time, dir, power] = record;
      const scaledValue = scaleAndClamp(power, ufoScaleFactor);
      return [
        0x05,
        scaledValue + (dir ? 128 : 0),
        scaledValue + (dir ? 128 : 0),
      ];
    }
    console.error("Invalid UFO data format: ", record);
  };

export const runDevice = (
  records: number[][],
  device: BluetoothRemoteGATTCharacteristic | null,
  generateUfoData: (record: number[]) => number[]
) => {
  records.reduce((p, record) => {
    return p.then(
      () =>
        new Promise((resolve) => {
          device?.writeValue(createBuffer(generateUfoData(record)));
          setTimeout(resolve, record[0]);
        })
    );
  }, Promise.resolve());
};
