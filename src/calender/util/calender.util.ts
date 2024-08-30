import { BusyTimes } from '../interfaces/freebusy.interface';

export function isRoomAvailable(busyTimes: BusyTimes[], startTime: Date, endTime: Date) {
  for (const timeSlot of busyTimes) {
    const busyStart = new Date(timeSlot.start);
    const busyEnd = new Date(timeSlot.end);

    if (startTime < busyEnd && endTime > busyStart) {
      return false;
    }
  }

  return true;
}