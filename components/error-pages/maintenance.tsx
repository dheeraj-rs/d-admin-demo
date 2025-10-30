import { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { LayoutContext } from '../../layout/context/LayoutContext';
import '../../styles/pages/error-pages/index.scss';

const Maintenance = () => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const { layoutConfig } = useContext(LayoutContext);
    useEffect(() => {
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 24);
        const timerInterval = setInterval(() => {
            const now = new Date();
            const difference = endTime.getTime() - now.getTime();
            if (difference <= 0) {
                clearInterval(timerInterval);
                return;
            }
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, []);

    return (
        <div className="maintenance__wrapper">
            <div className="maintenance-content">
                <div className="logo-container">
                    <Image
                        src={`/layout/logo-${layoutConfig.colorScheme === 'dark' ? 'dark' : 'white'}.svg`}
                        width={80}
                        height={80}
                        alt="logo"
                        className="logo-img"
                    />
                </div>
                <h1>We&apos;re Upgrading Our Website</h1>
                <p className="message">
                    Our team is currently performing scheduled maintenance to improve your experience. We apologize for any inconvenience and appreciate your
                    patience.
                </p>
                {/* <div className="timer-container">
                    <h2>We&apos;ll be back in:</h2>
                    <div className="countdown">
                        <div className="time-block">
                            <span className="time">{timeLeft.hours.toString().padStart(2, '0')}</span>
                            <span className="label">Hours</span>
                        </div>
                        <div className="time-divider">:</div>
                        <div className="time-block">
                            <span className="time">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                            <span className="label">Minutes</span>
                        </div>
                        <div className="time-divider">:</div>
                        <div className="time-block">
                            <span className="time">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                            <span className="label">Seconds</span>
                        </div>
                    </div>
                </div> */}
                <div className="contact-info">
                    <p>Need immediate assistance?</p>
                    <a href="mailto:drjsde@gamail.com" className="contact-link">
                        drjsde@gamail.com
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
