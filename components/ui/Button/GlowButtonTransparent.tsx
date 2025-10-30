import Link from 'next/link';

function GlowButtonTransparent({ text, href, onClick=()=>{} }: { text: string; href: string; onClick?: () => void  }) {

    const buttonContent = (
        <>
            <span className="glow-button-text">{text}</span>
            <div className="glow-button-dots">
                {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className="glow-dot" style={{ animationDelay: `${i * 0.2}s` }}></span>
                ))}
            </div>
        </>
    );

    if (href) {
        return (
            <Link href={href} className="glow-button-transparent" prefetch={false}>
                {buttonContent}
            </Link>
        );
    }

    return (
        <button className="glow-button-transparent" onClick={onClick}>
            {buttonContent}
        </button>
    );
}

export default GlowButtonTransparent;
