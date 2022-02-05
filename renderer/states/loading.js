import { atom, selector } from "recoil";
export const loadingState = selector({
  key: "loading",
  get: ({ get }) => {
    return get(asyncTasks) != 0;
  },
});

export const asyncTasks = atom({
  key: "asyncTasks",
  default: 0,
});
