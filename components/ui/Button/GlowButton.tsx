import Link from 'next/link';

function GlowButton({ text, href, onClick, className }: { text: string; href?: string; onClick?: () => void; className?: string }) {
    const buttonContent = (
        <>
            <span className="glow-button-text">{text}</span>
            <div className="glow-effect"></div>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={`glow-button ${className}`}>
                {buttonContent}
            </Link>
        );
    }

    return (
        <button className={`glow-button ${className}`} onClick={onClick}>
            {buttonContent}
        </button>
    );
}

export default GlowButton;
