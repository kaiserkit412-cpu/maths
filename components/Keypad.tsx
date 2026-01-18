import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onPress: (val: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
}

const Keypad: React.FC<KeypadProps> = ({ onPress, onDelete, onSubmit }) => {
  const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="w-full max-w-md mx-auto p-2 bg-white rounded-3xl shadow-xl border-4 border-indigo-100">
      <div className="grid grid-cols-3 gap-3">
        {nums.map((num) => (
          <button
            key={num}
            onClick={() => onPress(num)}
            className={`
              h-16 sm:h-20 rounded-2xl text-3xl font-bold transition-all active:scale-95 shadow-[0_4px_0_0_rgb(0,0,0,0.2)]
              ${num === '0' ? 'col-span-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}
            `}
          >
            {num}
          </button>
        ))}
        
        <button
          onClick={onDelete}
          className="h-16 sm:h-20 flex items-center justify-center rounded-2xl bg-orange-100 text-orange-600 font-bold transition-all active:scale-95 shadow-[0_4px_0_0_rgb(0,0,0,0.2)]"
          aria-label="Delete"
        >
          <Delete size={32} />
        </button>

        <button
          onClick={onSubmit}
          className="h-16 sm:h-20 col-span-1 flex items-center justify-center rounded-2xl bg-green-500 text-white font-bold transition-all active:scale-95 shadow-[0_4px_0_0_rgb(21,128,61,1)]"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Keypad;