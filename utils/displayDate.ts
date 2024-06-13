import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

export default function displayDate(dateString: string) {
  const date = new Date(dateString);

  const currentDate = new Date();
  const today = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const timeDiff = today.getTime() - date.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

  let displayString;
  if (dayDiff === 0) {
    displayString = "오늘";
  } else if (dayDiff === 1) {
    displayString = "어제";
  } else if (dayDiff > 1 && dayDiff < 30) {
    displayString = `${dayDiff}일 전`;
  } else if (dayDiff >= 30 && dayDiff < 365) {
    const monthDiff = Math.floor(dayDiff / 30);
    displayString = `${monthDiff}달 전`;
  } else {
    displayString = dayjs(date).format("YYYY-MM-DD");
  }
  return displayString;
}
