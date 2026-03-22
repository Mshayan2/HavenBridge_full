import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

const CustomDropdown = ({ label, options, selected, setSelected, variant = "default" }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Choose styling based on variant
  const getStyles = () => {
    if (variant === "form") {
      // Form style (teal theme - ONLY for SellForm.jsx)
      return {
        trigger: "border-2 border-teal-200 bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between cursor-pointer hover:border-teal-300 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none",
        dropdown: "absolute mt-1 w-full bg-white shadow-xl rounded-lg z-50 border-2 border-teal-200 max-h-60 overflow-y-auto",
        selectedBg: "bg-teal-500 text-white",
        hoverBg: "hover:bg-teal-50 hover:text-teal-700"
      };
    } else {
      // Default style (orange theme - for OTHER components)
      return {
        trigger: "border border-gray-300 bg-white px-3 py-3 rounded-lg flex items-center justify-between cursor-pointer hover:border-gray-400 transition-colors",
        dropdown: "absolute mt-1 w-full bg-white shadow-xl rounded-lg z-50 border border-gray-200 max-h-60 overflow-y-auto",
        selectedBg: "bg-orange-500 text-white",
        hoverBg: "hover:bg-gray-50"
      };
    }
  };

  const styles = getStyles();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Label */}
      <label className="text-gray-700 text-sm font-medium mb-1 block">
        {label}
      </label>
      <div
        onClick={() => setOpen(!open)}
        className={styles.trigger}
      >
        <span className="text-gray-900 truncate">{selected}</span>
        <FaChevronDown 
          className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} 
        />
      </div>

      {open && (
        <div className={styles.dropdown}>
          {options.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setSelected(item);
                setOpen(false);
              }}
              className={`px-3 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors
                ${
                  selected === item
                    ? styles.selectedBg
                    : `text-gray-700 ${styles.hoverBg}`
                }`}
            >
              {selected === item && <FaCheck size={14} />}
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
