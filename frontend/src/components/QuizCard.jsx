export default function QuizCard({ question, options, value, onChange, correctAnswer, explanation, submitted }) {
  return (
    <div className="rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4 transition">
      <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">{question}</h4>
      <div className="space-y-2">
        {(Array.isArray(options) ? options : []).map((option) => {
          let optionStyle = "border-slate-200 bg-slate-50/50 hover:border-sky-300";
          let labelBadge = null;
          
          if (submitted) {
            const isSelected = value === option;
            const isCorrect = option === correctAnswer;
            
            if (isCorrect) {
              optionStyle = "border-emerald-300 bg-emerald-50/40";
              labelBadge = <span className="ml-auto text-[10px] sm:text-xs font-semibold text-emerald-600">✓ Correct</span>;
            } else if (isSelected) {
              optionStyle = "border-rose-300 bg-rose-50/40";
              labelBadge = <span className="ml-auto text-[10px] sm:text-xs font-semibold text-rose-600">✗ Your Choice</span>;
            } else {
              optionStyle = "border-slate-100 bg-slate-50/20 opacity-60";
            }
          } else if (value === option) {
            optionStyle = "border-sky-500 bg-sky-50/30 ring-1 ring-sky-500/20";
          }
          
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-2.5 sm:gap-3 rounded-lg sm:rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 ${optionStyle} ${submitted ? 'cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={question}
                value={option}
                checked={value === option}
                disabled={submitted}
                onChange={(event) => onChange(event.target.value)}
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 accent-sky-600 cursor-pointer disabled:cursor-not-allowed shrink-0"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-700">{option}</span>
              {labelBadge}
            </label>
          );
        })}
      </div>
      
      {submitted && explanation && (
        <div className="rounded-lg sm:rounded-xl bg-slate-50 p-3 sm:p-4 border border-slate-200/50 text-[10px] sm:text-xs leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-800 block mb-1">💡 Explanation:</span>
          {explanation}
        </div>
      )}
    </div>
  );
}
