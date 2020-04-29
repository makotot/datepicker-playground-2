import { useEffect, useCallback } from "react";

export const useClickOutside = <E extends HTMLElement>({
  refs,
  callback
}: {
  refs: React.RefObject<E>[];
  callback: () => void;
}): void => {
  const handleClick = useCallback(
    (e: MouseEvent): void => {
      const isOutside = () => {
        return refs.every(ref => {
          return ref.current && !ref.current.contains(e.target as Node);
        });
      };
      if (isOutside()) {
        callback();
      }
    },
    [refs, callback]
  );

  useEffect(() => {
    document.addEventListener("click", handleClick, true);

    return (): void => {
      document.removeEventListener("click", handleClick, true);
    };
  });
};
