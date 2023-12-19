import moment from "moment";

const convertDurationTodateRanges = (startDate: Date, endDate: Date) => {
  let start = moment(new Date(startDate)).startOf("days").toDate();

  const dateRanges: string[] = [moment(start).format("YYYY-MM-DD")];

  while (moment(start).isBefore(moment(new Date(endDate)))) {
    start = moment(start).add(1, "days").toDate();

    dateRanges.push(moment(start).format("YYYY-MM-DD"));
  }

  return dateRanges;
};

const dateToISOString = (date: Date, type?: "start" | "end") => {
  let dateString = "";

  switch (type) {
    case "start":
      dateString = moment(new Date(date)).startOf("days").toISOString();
      break;
    case "end":
      dateString = moment(new Date(date)).endOf("days").toISOString();
      break;

    default:
      dateString = moment(new Date(date)).toISOString();
      break;
  }

  return dateString;
};

export { convertDurationTodateRanges, dateToISOString };
