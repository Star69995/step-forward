import React from "react";
import { useFormContext } from "react-hook-form";

const FormSection = ({
    name,
    label,
    rows = 3,
    showLabel = true,
    icon = "📝",
    placeholder = "כתוב את המחשבות שלך כאן...",
    showHint = true
}) => {
    const { register } = useFormContext();
    const isSingleLine = rows === 1;

    return (
        <div className={isSingleLine ? "" : "mb-6 animate-fadeIn"}>
            {/* Label with Icon */}
            {showLabel && (
                <label className="block text-sm font-semibold text-gray-800 mb-2 tracking-wide flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    {label}
                </label>
            )}

            {isSingleLine ? (
                <input
                    type="text"
                    {...register(name)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm"
                />
            ) : (
                <>
                    {/* Textarea */}
                    <textarea
                        {...register(name)}
                        rows={rows}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-sans transition focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white hover:border-gray-400"
                        style={{
                            minHeight: `${rows * 2.5}rem`,
                            fontFamily: "Rubik, sans-serif",
                            lineHeight: "1.6",
                            resize: "vertical"
                        }}
                    />

                    {/* Helper Text */}
                    {showHint && (
                        <small className="block text-gray-600 mt-2 text-xs italic">
                            💡 שתף את הרעיונות והרגשות שלך בחופש
                        </small>
                    )}
                </>
            )}
        </div>
    );
};

export default FormSection;