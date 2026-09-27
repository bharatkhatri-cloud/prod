import { useEffect, useRef } from 'react';

const useEffectSkipInitial = (callback, dependencies) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    callback();
  }, dependencies);
};

export default useEffectSkipInitial;
