import { DatePicker } from "@wangxiaojinger/qizhi-react";

const today = new Date();
const sevenDaysLater = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 7,
);

export default function DisabledTimeDemo() {
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div className="date-picker-docs-stack">
      <div className="date-picker-docs-row">
        <DatePicker
          disabledDate={(date) =>
            date < startOfToday || date > sevenDaysLater
          }
        />
        <DatePicker.RangePicker
          className="qizhi-date-picker--range-wide"
          disabledDate={(date) => date < startOfToday}
        />
      </div>

      <div className="date-picker-docs-row date-picker-docs-row--wide">
        <DatePicker
          showTime
          disabledTime={() => ({
            disabledHours: Array.from(
              { length: 18 },
              (_, index) => index + 6,
            ),
            disabledMinutes: Array.from(
              { length: 30 },
              (_, index) => index + 30,
            ),
            disabledSeconds: Array.from(
              { length: 30 },
              (_, index) => index + 30,
            ),
          })}
        />
        <DatePicker.RangePicker
          showTime
          hideDisabledTimeOptions
          disabledTime={(_date, field) =>
            field === "start"
              ? { disabledHours: [0, 1, 2, 3, 4, 5] }
              : {
                  disabledHours: Array.from(
                    { length: 18 },
                    (_, index) => index + 6,
                  ),
                }
          }
        />
      </div>
    </div>
  );
}
