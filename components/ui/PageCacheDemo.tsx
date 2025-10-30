'use client';

import React, { useState } from 'react';
import { usePageState } from '../../lib/pageCache';
import { Button } from './Button/Button';

interface PageCacheDemoProps {
    pageId: string;
}

export const PageCacheDemo: React.FC<PageCacheDemoProps> = ({ pageId }) => {
    const [counter, setCounter] = useState(0);
    const [text, setText] = useState('');
    const [selectedOption, setSelectedOption] = useState('option1');

    // Use the page caching hook
    const { state, setState, clearCache, isCached } = usePageState(
        pageId,
        {
            counter: 0,
            text: '',
            selectedOption: 'option1',
            timestamp: Date.now(),
        },
        1000 // Auto-save after 1 second of inactivity
    );

    // Update local state and cache
    const updateCounter = () => {
        const newCounter = counter + 1;
        setCounter(newCounter);
        setState(prev => ({ ...prev, counter: newCounter }));
    };

    const updateText = (newText: string) => {
        setText(newText);
        setState(prev => ({ ...prev, text: newText }));
    };

    const updateOption = (option: string) => {
        setSelectedOption(option);
        setState(prev => ({ ...prev, selectedOption: option }));
    };

    // Restore state from cache
    React.useEffect(() => {
        if (state) {
            setCounter(state.counter || 0);
            setText(state.text || '');
            setSelectedOption(state.selectedOption || 'option1');
        }
    }, [state]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Page Cache Demo</h3>
                <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${isCached ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {isCached ? 'Cached' : 'Not Cached'}
                    </span>
                    <Button onClick={clearCache} outlined size="small" severity="danger">
                        Clear Cache
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Counter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Counter: {counter}
                    </label>
                    <Button onClick={updateCounter} size="small">
                        Increment
                    </Button>
                </div>

                {/* Text Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Input
                    </label>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => updateText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type something... (will be cached)"
                    />
                </div>

                {/* Select Option */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Option
                    </label>
                    <select
                        value={selectedOption}
                        onChange={(e) => updateOption(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                </div>

                {/* Cache Info */}
                <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cache Information</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Page ID:</strong> {pageId}</p>
                        <p><strong>Last Saved:</strong> {state?.timestamp ? new Date(state.timestamp).toLocaleTimeString() : 'Never'}</p>
                        <p><strong>Status:</strong> {isCached ? 'Your changes are being automatically saved' : 'Changes will be saved when you make them'}</p>
                    </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                    💡 Try changing these values, then navigate to another page and come back.
                    Your changes should be preserved!
                </div>
            </div>
        </div>
    );
};
