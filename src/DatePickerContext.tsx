import React from "react";
import {
  addMonths,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  format,
  isValid,
  parseISO,
  toDate
} from "date-fns";
import { useClickOutside } from "./useClickOutside";

type DatePickerState = {
  inputValue: {
    start: string;
    end?: string;
  };
  selectedDate: {
    start?: Date;
    end?: Date;
  };
  isVisible?: boolean;
  numberOfMonths?: number;
  firstDatesOfMonths?: Date[];
};

enum ActionTypes {
  HANDLE_FOCUS_INPUT_START_DATE = "HANDLE_FOCUS_INPUT_START_DATE",
  HANDLE_BULR_INPUT_START_DATE = "HANDLE_BULR_INPUT_START_DATE",
  HANDLE_CHANGE_INPUT_START_DATE = "HANDLE_CHANGE_INPUT_START_DATE",
  HANDLE_SELECT_START_DATE = "HANDLE_SELECT_START_DATE",
  HANDLE_RESET = "HANDLE_RESET",
  HANDLE_GO_TO_PREV_MONTH = "HANDLE_GO_TO_PREV_MONTH",
  HANDLE_GO_TO_NEXT_MONTH = "HANDLE_GO_TO_NEXT_MONTH"
}

type DatePickerAction =
  | {
      type: ActionTypes.HANDLE_RESET;
    }
  | {
      type: ActionTypes.HANDLE_FOCUS_INPUT_START_DATE;
    }
  | {
      type: ActionTypes.HANDLE_BULR_INPUT_START_DATE;
    }
  | {
      type: ActionTypes.HANDLE_CHANGE_INPUT_START_DATE;
      payload: {
        value: string;
      };
    }
  | {
      type: ActionTypes.HANDLE_GO_TO_PREV_MONTH;
    }
  | {
      type: ActionTypes.HANDLE_GO_TO_NEXT_MONTH;
    }
  | {
      type: ActionTypes.HANDLE_SELECT_START_DATE;
      payload: {
        date: Date;
      };
    };

type DatePickerReducerType = [
  DatePickerState,
  React.Dispatch<DatePickerAction>
];

const initialState = {
  inputValue: {
    start: "",
    end: undefined
  },
  selectedDate: {
    start: undefined,
    end: undefined
  },
  isVisible: false,
  numberOfMonths: 1,
  firstDatesOfMonths: []
};

export const DatePickerContext = React.createContext([
  initialState,
  (): void => {}
] as DatePickerReducerType);

export const datepickerReducer = (
  state: DatePickerState = initialState,
  action: DatePickerAction
): DatePickerState => {
  switch (action.type) {
    case ActionTypes.HANDLE_RESET:
      return {
        ...state,
        inputValue: {
          start: "",
          end: ""
        },
        selectedDate: {
          start: undefined,
          end: undefined
        }
      };
    case ActionTypes.HANDLE_FOCUS_INPUT_START_DATE:
      return {
        ...state,
        isVisible: true
      };
    case ActionTypes.HANDLE_BULR_INPUT_START_DATE:
      return {
        ...state,
        isVisible: false
      };
    case ActionTypes.HANDLE_CHANGE_INPUT_START_DATE:
      const { value } = action.payload;
      const parsedValue = parseISO(value);
      const isValidStartDate = isValid(parsedValue);
      const selectedStartDate = isValidStartDate
        ? toDate(parsedValue)
        : state.selectedDate.start;
      const firstDatesOfMonths = getFirstDatesOfMonths({
        numberOfMonths: state.numberOfMonths,
        startDate: selectedStartDate
      });

      return {
        ...state,
        inputValue: {
          ...state.inputValue,
          start: value
        },
        selectedDate: {
          ...state.selectedDate,
          start: selectedStartDate
        },
        firstDatesOfMonths
      };
    case ActionTypes.HANDLE_SELECT_START_DATE:
      return {
        ...state,
        isVisible: false,
        inputValue: {
          ...state.inputValue,
          start: format(action.payload.date, "yyyy/MM/dd")
        },
        selectedDate: {
          ...state.selectedDate,
          start: action.payload.date
        }
      };
    case ActionTypes.HANDLE_GO_TO_PREV_MONTH:
      const currentMonthDateForPrev = (state.firstDatesOfMonths && state.firstDatesOfMonths.length > 0) ? state?.firstDatesOfMonths[0] : new Date();
      return {
        ...state,
        firstDatesOfMonths: getFirstDatesOfMonths({
          numberOfMonths: state.numberOfMonths,
          startDate: addMonths(currentMonthDateForPrev, -1)
         })
      };
    case ActionTypes.HANDLE_GO_TO_NEXT_MONTH:
      const currentMonthDateForNext = (state.firstDatesOfMonths && state.firstDatesOfMonths.length > 0) ? state?.firstDatesOfMonths[0] : new Date();
      return {
        ...state,
        firstDatesOfMonths: getFirstDatesOfMonths({
          numberOfMonths: state.numberOfMonths,
          startDate: addMonths(currentMonthDateForNext, 1)
          })
      };
    default:
      return state;
  }
};

const getFirstDatesOfMonths = ({
  numberOfMonths = 1,
  startDate = new Date()
}: {
  numberOfMonths?: number;
  startDate?: Date;
}): Date[] => {
  return new Array(numberOfMonths)
    .fill(startDate)
    .reduce((prev, current, index) => {
      const date = addMonths(current, index);
      const firstDayOfMonth = startOfMonth(date);
      return [...prev, firstDayOfMonth];
    }, []);
};

export const DatePickerProvider: React.FC<{
  defaultValues: DatePickerState;
}> = ({ defaultValues, children }) => {
  const state = {
    ...defaultValues,
    firstDatesOfMonths: getFirstDatesOfMonths({
      numberOfMonths: defaultValues.numberOfMonths
    })
  };
  const datePickerReducer = React.useReducer(datepickerReducer, state);

  return (
    <DatePickerContext.Provider value={datePickerReducer}>
      {children}
    </DatePickerContext.Provider>
  );
};

export const useDatePickerContext = () => {
  const [state, dispatch] = React.useContext(DatePickerContext);
  const inputRef = React.useRef<HTMLElement>(null);
  const monthsRef = React.useRef<HTMLElement>(null);

  const handleReset = () => {
    dispatch({
      type: ActionTypes.HANDLE_RESET
    });
  };
  const handleFocus = () => {
    dispatch({
      type: ActionTypes.HANDLE_FOCUS_INPUT_START_DATE
    });
  };
  const handleBlur = () => {
    dispatch({
      type: ActionTypes.HANDLE_BULR_INPUT_START_DATE
    });
  };
  const handleChangeStartInputValue = ({ value }: { value: string }) => {
    dispatch({
      type: ActionTypes.HANDLE_CHANGE_INPUT_START_DATE,
      payload: {
        value
      }
    });
  };
  const handleSelectStartDate = ({ date }: { date: Date }) => {
    dispatch({
      type: ActionTypes.HANDLE_SELECT_START_DATE,
      payload: {
        date
      }
    });
  };
  const handleGoToPrevMonth = () => {
    dispatch({
      type: ActionTypes.HANDLE_GO_TO_PREV_MONTH
    });
  };
  const handleGoToNextMonth = () => {
    dispatch({
      type: ActionTypes.HANDLE_GO_TO_NEXT_MONTH
    });
  };

  const getMonthDays = (date: Date) =>
    eachDayOfInterval({
      start: startOfWeek(startOfMonth(date)),
      end: endOfWeek(endOfMonth(date))
    }).map((day: Date) => {
      return {
        day,
        isSameMonth: isSameMonth(day, date)
      };
    });
  const firstMonthDate = (state && state.firstDatesOfMonths) ? state?.firstDatesOfMonths[0] : new Date()

  useClickOutside<HTMLElement>({
    refs: [inputRef, monthsRef],
    callback: () => handleBlur()
  });

  return {
    state,
    handleReset,
    handleFocus,
    handleBlur,
    handleChangeStartInputValue,
    handleSelectStartDate,
    handleGoToPrevMonth,
    handleGoToNextMonth,
    getMonthDays,
    firstMonthDate,
    format,
    inputRef,
    monthsRef
  };
};
