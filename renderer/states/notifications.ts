import { AtomEffect, atom } from "recoil";
import update from "immutability-helper";

const timerEffect: AtomEffect<SnackbarNotification[]> = ({
  setSelf,
  onSet,
}) => {
  onSet((newValue, _prevValue) => {
    if (newValue.length == 0) return;
    const lastItem = newValue[newValue.length - 1];
    if (lastItem.done) return;
    setTimeout(() => {
      setSelf((oldValue) => {
        if (!Array.isArray(oldValue)) return oldValue;
        const index = oldValue.findIndex(
          (item) => item.createdAt == lastItem.createdAt
        );
        if (index == -1) return oldValue;
        return update(oldValue, { [index]: { done: { $set: true } } });
      });
    }, 5000);
  });
};

export const notificationsState = atom<SnackbarNotification[]>({
  key: "notifications",
  default: [],
  effects: [timerEffect],
});
