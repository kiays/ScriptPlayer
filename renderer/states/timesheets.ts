import { atom, AtomEffect, selectorFamily } from "recoil";
import RecoilKeys from "./keys";
import update from "immutability-helper";
import { AllTimeSheets, TimeSheet, TimeSheetMeta } from "../types";

const ipcEffect: AtomEffect<AllTimeSheets> = ({ setSelf, onSet }) => {
  window.mainProc.getAllCSVs().then(setSelf);
  onSet(async (newValue, _prevVarlue, _isReset) => {
    await window.mainProc.setAllCSVs(newValue);
  });
};

export const allTimeSheets = atom<AllTimeSheets>({
  key: RecoilKeys.TIMESHEETS,
  default: {},
  effects: [ipcEffect],
});

export const timesheetById = selectorFamily<TimeSheetMeta, string>({
  key: RecoilKeys.TIMESHEET_BY_ID,
  get:
    (id: string) =>
    ({ get }) => {
      const timesheets = get(allTimeSheets);
      if (id in timesheets) {
        return timesheets[id];
      }
      return null;
    },
  set:
    (id: string) =>
    ({ get, set }, newTimeSheet: TimeSheet | TimeSheetMeta) => {
      const timesheets = get(allTimeSheets);
      const { hash, path, name } = newTimeSheet;
      set(
        allTimeSheets,
        update(timesheets, { [id]: { $set: { hash, path, name } } })
      );
    },
});
