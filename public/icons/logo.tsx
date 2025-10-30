import React, { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <img id="logo" src="/layout/logo-dark.svg" alt="logo" className="loader__logo" />
  );
};

export default Logo;