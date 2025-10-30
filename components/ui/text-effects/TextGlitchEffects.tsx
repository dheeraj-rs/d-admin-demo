const TextGlitchEffects = ({ text = 'Not Found' }: { text: string }) => {
    return (
        <h1 className="text-glitch-container">
            <span className="text-glitch-title" data-text={text}>
                {text}
            </span>
        </h1>
    );
};

export default TextGlitchEffects;
