interface ErrorCardProps {
  message: string;
  solution: string;
  onRetry: () => void;
}

export default function ErrorCard({ message, solution, onRetry }: ErrorCardProps) {
  return (
    <div id="result-area" className="py-12 px-6">
      <div className="max-w-md mx-auto text-center bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-4">
        <div className="text-4xl">&#9888;&#65039;</div>
        <p className="text-gray-800 font-medium">{message}</p>
        {solution && <p className="text-sm text-gray-500">{solution}</p>}
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 transition-colors"
        >
          다시 분석하기
        </button>
      </div>
    </div>
  );
}
