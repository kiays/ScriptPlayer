import { atom, selector } from "recoil";
export const loadingState = selector<boolean>({
  key: "loading",
  get: ({ get }) => {
    return get(asyncTasks) != 0;
  },
});

export const asyncTasks = atom<number>({
  key: "asyncTasks",
  default: 0,
});
