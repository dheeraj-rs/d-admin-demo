import React from "react";
import './animated-background.scss';
interface Props {
  onStart: () => void;
}


const AnimatedBackground: React.FC<Props> = (props) => {
  return (
    <video
      className="background-video"
      onPlay={() => props.onStart()}
      preload="auto"
      autoPlay
      playsInline={true}
      muted={true}
      loop={false}
    >
      <source src='/videos/GradientBackground.mp4' />
    </video>
  );
};

export default AnimatedBackground;
