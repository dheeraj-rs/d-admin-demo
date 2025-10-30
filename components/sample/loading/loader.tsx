import React, { useEffect, useRef } from "react";
import Logo from '../../../public/icons/logo';
import { introLogoAnimate } from '../../../lib/animations';
import "./loader.scss";

interface LoaderProps {
  finishLoading: () => void;
}

const Loader: React.FC<LoaderProps> = (props) => {
  const animationStarted = useRef(false);

  useEffect(() => {
    if (!animationStarted.current) {
      animationStarted.current = true;
      introLogoAnimate(props.finishLoading);
    }
  }, [props.finishLoading]);

  return (
    <div className="loader">
      <Logo className="loader__logo" />
    </div>
  );
};

export default Loader;
