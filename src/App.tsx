import * as React from "react";
import { Formik, useFormikContext } from "formik";
import { DatePickerProvider, useDatePickerContext } from "./DatePickerContext";

const Month: React.FC<{
  firstDate: Date;
}> = ({ firstDate }) => {
  const { setFieldValue } = useFormikContext();

  const {
    getMonthDays,
    format,
    handleSelectStartDate
  } = useDatePickerContext();
  const days = getMonthDays(firstDate);
  const selectStartDate = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.persist();
    const { date } = e.currentTarget.dataset;
    handleSelectStartDate({
      date: new Date(date as string)
    });
    setFieldValue("start", date);
  };

  return (
    <div>
      <h3>{format(firstDate, "MM")}</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)"
        }}
      >
        {days.map((day: { day: Date }) => (
          <div key={day.day.toDateString()}>
            <div
              style={{
                cursor: "pointer"
              }}
              role="button"
              onClick={selectStartDate}
              data-date={day.day.toDateString()}
            >
              {format(day.day, "dd")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DatePickerField = () => {
  const { setFieldValue, values } = useFormikContext<{
    start: string;
  }>();
  const {
    state,
    handleFocus,
    handleReset,
    handleChangeStartInputValue,
    handleGoToPrevMonth,
    handleGoToNextMonth,
    firstMonthDate,
    inputRef,
    monthsRef
  } = useDatePickerContext();
  const goToPrevMonth = () => {
    handleGoToPrevMonth();
  }
  const goToNextMonth = () => {
    handleGoToNextMonth();
  }
  const changeStartInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    handleChangeStartInputValue({ value: value });
    setFieldValue("start", value);
  };
  
  React.useEffect(() => {
    if (!values.start) {
      handleReset();
    }
    // eslint-disable-next-line
  }, [values.start]);

  return (
    <div>
      <input
        ref={inputRef as any}
        type="text"
        value={state.inputValue.start}
        onChange={changeStartInputValue}
        onFocus={handleFocus}
      />
      {state.isVisible && (
        <div ref={monthsRef as any}>
          <button type="button" onClick={ goToPrevMonth }>prev</button>
          <button type="button" onClick={ goToNextMonth }>next</button>
          <div>
            <div>
              { firstMonthDate.getFullYear() }
              /
              { firstMonthDate.getMonth() + 1 }
            </div>
            {state?.firstDatesOfMonths?.map(day => (
              <Month key={day.toDateString()} firstDate={day} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <Formik
        enableReinitialize
        initialValues={{
          start: ""
        }}
        onSubmit={values => {
          console.log(values);
        }}
      >
        {({ values, handleSubmit, handleReset }) => (
          <form onSubmit={handleSubmit}>
            <DatePickerProvider
              defaultValues={{
                inputValue: {
                  start: values.start,
                  end: ""
                },
                selectedDate: {
                  start: undefined,
                  end: undefined
                },
                numberOfMonths: 2,
                isVisible: false
              }}
            >
              <DatePickerField />
            </DatePickerProvider>
            <button type="submit">submit</button>
            <button type="button" onClick={handleReset}>
              reset
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
}
