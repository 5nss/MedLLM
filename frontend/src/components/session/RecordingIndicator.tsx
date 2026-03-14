export function RecordingIndicator({ isRecording, connectionStatus }: { isRecording: boolean; connectionStatus: string }) {
    return (
        <div className="flex items-center gap-2">
            {isRecording ? (
                <span className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Recording
                </span>
            ) : (
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Paused
                </span>
            )}
            <span className="text-xs text-slate-400 ml-2">WS: {connectionStatus}</span>
        </div>
    );
}
