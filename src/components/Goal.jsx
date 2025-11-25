import React from "react";
import { useFormContext } from "react-hook-form";

const Goal = ({ baseName, index, color = "#0d6efd" }) => {
    const { register } = useFormContext();

    return (
        <div
            className="rounded-lg p-5 mb-4 transition hover:shadow-md border-r-4"
            style={{
                backgroundColor: `${color}08`,
                borderRightColor: color
            }}
        >
            {/* Goal Number Badge */}
            <div
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-sm mb-4"
                style={{ backgroundColor: color }}
            >
                {index}
            </div>

            {/* Row Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Goal Text Input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                        🎯 תיאור היעד
                    </label>
                    <input
                        type="text"
                        {...register(`${baseName}.target${index}.text`)}
                        placeholder={`תאר את היעד #${index} שלך...`}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 font-sans transition focus:outline-none focus:border-2"
                        style={{
                            borderColor: "rgb(224, 224, 224)",
                            fontFamily: "Rubik, sans-serif"
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = color;
                            e.target.style.boxShadow = `0 0 0 3px ${color}20`;
                            e.target.style.backgroundColor = `${color}05`;
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "rgb(224, 224, 224)";
                            e.target.style.boxShadow = "none";
                            e.target.style.backgroundColor = "white";
                        }}
                    />
                </div>

                {/* End Date Input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                        📅 תאריך סיום
                    </label>
                    <input
                        type="date"
                        {...register(`${baseName}.target${index}.endDate`)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 font-sans transition focus:outline-none focus:border-2"
                        style={{
                            borderColor: "rgb(224, 224, 224)",
                            fontFamily: "Rubik, sans-serif"
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = color;
                            e.target.style.boxShadow = `0 0 0 3px ${color}20`;
                            e.target.style.backgroundColor = `${color}05`;
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "rgb(224, 224, 224)";
                            e.target.style.boxShadow = "none";
                            e.target.style.backgroundColor = "white";
                        }}
                    />
                </div>
            </div>

            {/* Helper Text */}
            <small className="block text-gray-600 mt-3 text-xs italic">
                💡 הגדר יעד קטן, מדידה, ברור ובעל לוח זמנים
            </small>
        </div>
    );
};

export default Goal;